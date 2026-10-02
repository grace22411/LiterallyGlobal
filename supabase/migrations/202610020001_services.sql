-- Run once after 202610010001_eligibility.sql. Existing data is preserved.
begin;
create table public.grace_conversations (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 route text not null check(route in ('digital-technology','academia-research','design')),
 assessment_id uuid references public.assessments(id) on delete set null,
 turns jsonb not null default '[]', report jsonb, version integer not null default 0,
 consent_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index grace_conversations_owner on public.grace_conversations(user_id,created_at desc);
alter table public.grace_conversations enable row level security;
create policy "Own Grace conversations" on public.grace_conversations for select to authenticated using((select auth.uid())=user_id);
revoke all on public.grace_conversations from anon,authenticated;
grant select on public.grace_conversations to authenticated;
grant all on public.grace_conversations to service_role;

create table public.service_applications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 submission_id uuid not null, service text not null check(service in ('document-review','full-support')),
 name text not null, email text not null, whatsapp text not null, notes text not null default '',
 drive_url text not null default '', document_method text not null check(document_method in ('drive','upload')),
 payment_plan text check(payment_plan in ('once','twice')), assessment_id uuid references public.assessments(id) on delete set null,
 conversation_id uuid references public.grace_conversations(id) on delete set null, readiness jsonb,
 status text not null default 'draft' check(status in ('draft','submitted','in_review','awaiting_information','accepted','completed')),
 decision text not null default 'pending' check(decision in ('pending','suitable','build_evidence','consultation')),
 verdict text not null default '', internal_notes text not null default '', version integer not null default 0,
 consent_at timestamptz not null default now(), created_at timestamptz not null default now(), submitted_at timestamptz,
 unique(user_id,submission_id), check((service='document-review' and payment_plan is not null) or (service='full-support' and payment_plan is null))
);
create index service_applications_owner on public.service_applications(user_id,created_at desc);
create index service_applications_queue on public.service_applications(status,created_at desc);
alter table public.service_applications enable row level security;
create policy "Own service applications" on public.service_applications for select to authenticated using((select auth.uid())=user_id);
revoke all on public.service_applications from anon,authenticated;
grant select(id,user_id,submission_id,service,name,email,whatsapp,notes,drive_url,document_method,payment_plan,assessment_id,conversation_id,readiness,status,decision,verdict,version,created_at,submitted_at) on public.service_applications to authenticated;
grant all on public.service_applications to service_role;

create table public.application_files (
 id uuid primary key, application_id uuid not null references public.service_applications(id) on delete cascade,
 name text not null, mime_type text not null, byte_size integer not null check(byte_size between 1 and 10485760),
 storage_path text not null unique, created_at timestamptz not null default now()
);
alter table public.application_files enable row level security;
create policy "Own application files" on public.application_files for select to authenticated using(exists(select 1 from public.service_applications a where a.id=application_id and a.user_id=(select auth.uid())));
revoke all on public.application_files from anon,authenticated;
grant select(id,application_id,name,mime_type,byte_size,created_at) on public.application_files to authenticated;
grant all on public.application_files to service_role;

-- The app signs downloads after checking ownership/admin access. No public URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('application-documents','application-documents',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table public.application_payments (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.service_applications(id) on delete cascade,
 installment integer not null check(installment in (1,2)), amount integer not null check(amount in (50000,100000)),
 currency text not null default 'gbp' check(currency='gbp'), status text not null default 'pending' check(status in ('pending','paid','refunded')),
 attempt_id uuid not null default gen_random_uuid(), checkout_id text unique, checkout_url text, checkout_expires_at timestamptz,
 lease_until timestamptz, paid_at timestamptz, provider_payment_id text unique, created_at timestamptz not null default now(),
 unique(application_id,installment)
);
alter table public.application_payments enable row level security;
create policy "Own payments" on public.application_payments for select to authenticated using(exists(select 1 from public.service_applications a where a.id=application_id and a.user_id=(select auth.uid())));
revoke all on public.application_payments from anon,authenticated;
grant select(id,application_id,installment,amount,currency,status,paid_at) on public.application_payments to authenticated;
grant all on public.application_payments to service_role;

create table public.application_activity (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.service_applications(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null, action text not null, created_at timestamptz not null default now()
);
alter table public.application_activity enable row level security;
revoke all on public.application_activity from anon,authenticated;
grant all on public.application_activity to service_role;

create function public.register_application_file(p_id uuid,p_application uuid,p_user uuid,p_name text,p_mime text,p_size integer,p_path text)
returns void language plpgsql security invoker set search_path='' as $$
declare a public.service_applications; file_count integer; total_size bigint;
begin
 select * into a from public.service_applications where id=p_application and user_id=p_user for update;
 if a.id is null or a.status<>'draft' then raise exception 'Application unavailable'; end if;
 select count(*),coalesce(sum(byte_size),0) into file_count,total_size from public.application_files where application_id=p_application;
 if file_count>=10 or total_size+p_size>52428800 then raise exception 'Upload limit reached'; end if;
 insert into public.application_files(id,application_id,name,mime_type,byte_size,storage_path) values(p_id,p_application,p_name,p_mime,p_size,p_path);
end; $$;

create function public.submit_service_application(p_id uuid,p_user uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare a public.service_applications;
begin
 select * into a from public.service_applications where id=p_id and user_id=p_user for update;
 if a.id is null then raise exception 'Application not found'; end if;
 if a.status<>'draft' then return; end if;
 if a.service='document-review' and a.drive_url='' and not exists(select 1 from public.application_files where application_id=a.id) then raise exception 'Documents required'; end if;
 if a.service='full-support' and a.assessment_id is null and a.conversation_id is null then raise exception 'Readiness report required'; end if;
 update public.service_applications set status='submitted',submitted_at=now(),version=version+1 where id=a.id;
 insert into public.application_activity(application_id,actor_id,action) values(a.id,p_user,'Application submitted');
end; $$;

create function public.review_service_application(p_id uuid,p_actor uuid,p_version integer,p_status text,p_decision text,p_verdict text,p_notes text)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.service_applications set status=p_status,decision=p_decision,verdict=p_verdict,internal_notes=p_notes,version=version+1
 where id=p_id and version=p_version and status<>'draft';
 if not found then return false; end if;
 insert into public.application_activity(application_id,actor_id,action) values(p_id,p_actor,'Review updated: '||p_status||' / '||p_decision);
 return true;
end; $$;

create function public.reserve_review_payment(p_application uuid,p_user uuid)
returns setof public.application_payments language plpgsql security invoker set search_path='' as $$
declare a public.service_applications; payment public.application_payments; next_installment integer; expected_amount integer;
begin
 select * into a from public.service_applications where id=p_application and user_id=p_user for update;
 if a.id is null or a.service<>'document-review' or a.status='draft' then raise exception 'Payment not available'; end if;
 if exists(select 1 from public.application_payments where application_id=a.id and status='refunded') then raise exception 'Contact the team about this payment'; end if;
 next_installment:=case when exists(select 1 from public.application_payments where application_id=a.id and installment=1 and status='paid') then 2 else 1 end;
 if next_installment=2 and a.payment_plan='once' then return; end if;
 expected_amount:=case when a.payment_plan='once' then 100000 else 50000 end;
 insert into public.application_payments(application_id,installment,amount) values(a.id,next_installment,expected_amount) on conflict(application_id,installment) do nothing;
 select * into payment from public.application_payments where application_id=a.id and installment=next_installment for update;
 if payment.status='paid' then return; end if;
 -- A live or recently expired checkout must be reconciled with Stripe first.
 if payment.checkout_id is not null then return next payment; return; end if;
 if payment.lease_until>now() then raise exception 'Checkout is being prepared'; end if;
 update public.application_payments set lease_until=now()+interval '1 minute' where id=payment.id returning * into payment;
 return next payment;
end; $$;

create function public.confirm_review_payment(p_id uuid,p_attempt uuid,p_checkout text,p_amount integer,p_currency text,p_payment text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare payment public.application_payments;
begin
 select * into payment from public.application_payments where id=p_id for update;
 if payment.id is null or payment.attempt_id<>p_attempt or payment.amount<>p_amount or payment.currency<>p_currency or (payment.checkout_id is not null and payment.checkout_id<>p_checkout) then raise exception 'Payment details mismatch'; end if;
 if payment.status='refunded' then return false; end if;
 if payment.status='paid' then return true; end if;
 update public.application_payments set status='paid',paid_at=now(),checkout_id=p_checkout,provider_payment_id=p_payment,lease_until=null where id=p_id;
 insert into public.application_activity(application_id,action) values(payment.application_id,'Payment confirmed: instalment '||payment.installment);
 return true;
end; $$;

revoke all on function public.register_application_file(uuid,uuid,uuid,text,text,integer,text) from public,anon,authenticated;
revoke all on function public.submit_service_application(uuid,uuid) from public,anon,authenticated;
revoke all on function public.review_service_application(uuid,uuid,integer,text,text,text,text) from public,anon,authenticated;
revoke all on function public.reserve_review_payment(uuid,uuid) from public,anon,authenticated;
revoke all on function public.confirm_review_payment(uuid,uuid,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.register_application_file(uuid,uuid,uuid,text,text,integer,text) to service_role;
grant execute on function public.submit_service_application(uuid,uuid) to service_role;
grant execute on function public.review_service_application(uuid,uuid,integer,text,text,text,text) to service_role;
grant execute on function public.reserve_review_payment(uuid,uuid) to service_role;
grant execute on function public.confirm_review_payment(uuid,uuid,text,integer,text,text) to service_role;

commit;
