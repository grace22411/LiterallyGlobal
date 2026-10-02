create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  route text not null check (route in ('digital-technology', 'academia-research', 'design')),
  answers jsonb not null,
  result jsonb not null,
  rules_version text not null,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);
create index assessments_user_created on public.assessments(user_id, created_at desc);
alter table public.assessments enable row level security;
create policy "Read only your assessments" on public.assessments for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.assessments from anon, authenticated;
grant select on public.assessments to authenticated;
grant all on public.assessments to service_role;

create table public.result_email_jobs (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  last_error text,
  created_at timestamptz not null default now()
);
create index result_email_jobs_due on public.result_email_jobs(next_attempt_at) where status in ('pending','failed','sending');
alter table public.result_email_jobs enable row level security;
create policy "Read delivery status for your result" on public.result_email_jobs for select to authenticated using (
  exists (select 1 from public.assessments a where a.id = assessment_id and a.user_id = (select auth.uid()))
);
revoke all on public.result_email_jobs from anon, authenticated;
grant select (id,assessment_id,status,attempts,sent_at) on public.result_email_jobs to authenticated;
grant all on public.result_email_jobs to service_role;

create table public.request_limits (
  key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
create index request_limits_expiry on public.request_limits(expires_at);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
grant all on public.request_limits to service_role;

-- Only server code holding the service key may store a computed result.
create function public.save_eligibility_assessment(
  p_user_id uuid, p_submission_id uuid, p_route text, p_answers jsonb,
  p_result jsonb, p_rules_version text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_assessment_id uuid; existing_answers jsonb; existing_route text;
begin
  insert into public.assessments(user_id,submission_id,route,answers,result,rules_version)
  values(p_user_id,p_submission_id,p_route,p_answers,p_result,p_rules_version)
  on conflict(user_id,submission_id) do nothing;
  select id,answers,route into v_assessment_id,existing_answers,existing_route
    from public.assessments where user_id=p_user_id and submission_id=p_submission_id;
  if existing_answers <> p_answers or existing_route <> p_route then
    raise exception 'Submission already used for different answers' using errcode='23505';
  end if;
  insert into public.result_email_jobs(assessment_id) values(v_assessment_id)
    on conflict(assessment_id) do nothing;
  return v_assessment_id;
end;
$$;

create function public.consume_request_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare count_now integer;
begin
  delete from public.request_limits where expires_at < now() - interval '1 day';
  insert into public.request_limits(key,hits,expires_at)
  values(p_key,1,now()+make_interval(secs=>p_window_seconds))
  on conflict(key) do update set
    hits=case when public.request_limits.expires_at<=now() then 1 else public.request_limits.hits+1 end,
    expires_at=case when public.request_limits.expires_at<=now() then excluded.expires_at else public.request_limits.expires_at end
  returning hits into count_now;
  return count_now<=p_limit;
end;
$$;

create function public.claim_result_email(p_id uuid)
returns setof public.result_email_jobs language plpgsql security invoker set search_path = '' as $$
begin
  -- Resend retains idempotency keys for 24 hours. Stop automatic retries before
  -- that boundary so an unrecorded acknowledgement cannot create a duplicate.
  update public.result_email_jobs set status='failed',attempts=5,
    last_error='Delivery confirmation window expired; manual investigation required.',
    lease_token=null,lease_until=null
  where id=p_id and status<>'sent' and first_attempt_at<now()-interval '23 hours'
    and (status<>'sending' or lease_until<now());
  return query
  update public.result_email_jobs set status='sending', attempts=attempts+1,
    first_attempt_at=coalesce(first_attempt_at,now()),
    lease_token=gen_random_uuid(), lease_until=now()+interval '5 minutes'
  where id=p_id and status<>'sent' and attempts<5 and next_attempt_at<=now()
    and (status<>'sending' or lease_until<now())
  returning *;
end;
$$;

create function public.finish_result_email(p_id uuid,p_lease uuid,p_success boolean,p_provider_id text,p_error text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  update public.result_email_jobs set
    status=case when p_success then 'sent' else 'failed' end,
    sent_at=case when p_success then now() else null end,
    provider_id=p_provider_id,
    last_error=p_error,
    next_attempt_at=now()+interval '2 minutes'*power(2,least(attempts,5)),
    lease_token=null,lease_until=null
  where id=p_id and lease_token=p_lease and status='sending';
end;
$$;

revoke all on function public.save_eligibility_assessment(uuid,uuid,text,jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.consume_request_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.claim_result_email(uuid) from public,anon,authenticated;
revoke all on function public.finish_result_email(uuid,uuid,boolean,text,text) from public,anon,authenticated;
grant execute on function public.save_eligibility_assessment(uuid,uuid,text,jsonb,jsonb,text) to service_role;
grant execute on function public.consume_request_limit(text,integer,integer) to service_role;
grant execute on function public.claim_result_email(uuid) to service_role;
grant execute on function public.finish_result_email(uuid,uuid,boolean,text,text) to service_role;
