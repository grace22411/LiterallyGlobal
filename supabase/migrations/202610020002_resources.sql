-- Private lead capture for the free-resource forms. Apply after the eligibility migration.
begin;
create table public.resource_requests (
 id uuid primary key,
 resource text not null check (resource in ('checklist','statement','workbook')),
 name text not null check (char_length(name) between 1 and 100),
 email text not null check (char_length(email) between 3 and 254),
 phone text not null check (phone ~ '^\+[1-9][0-9]{6,14}$'),
 location text not null check (char_length(location) between 1 and 160),
 privacy_notice text not null default '2026-10-02-resources',
 created_at timestamptz not null default now(),
 accessed_at timestamptz
);
create index resource_requests_created on public.resource_requests(created_at desc);
create index resource_requests_resource on public.resource_requests(resource, created_at desc);
alter table public.resource_requests enable row level security;
revoke all on public.resource_requests from anon, authenticated;
grant select, insert, update on public.resource_requests to service_role;
commit;
