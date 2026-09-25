create table public.journal_entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null, content text not null default '', mood text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(user_id,entry_date));
create table public.house_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('yoga','remember','idea','news','task','work','experiment')),
 day date not null default current_date, title text not null, content text not null default '', url text,
 image_url text, category text, duration_minutes integer check(duration_minutes > 0), opened_at timestamptz,
 read_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now());
create index house_records_owner_kind_day on public.house_records(user_id,kind,day);
create table public.house_state (
 user_id uuid primary key references auth.users(id) on delete cascade, fireplace_on boolean not null default false,
 radio_on boolean not null default false, radio_volume integer not null default 50 check(radio_volume between 0 and 100),
 updated_at timestamptz not null default now());
alter table public.briefings add column if not exists categories text[] not null default '{}';
alter table public.briefings add column if not exists sources text[] not null default '{}';
alter table public.briefings add column if not exists read_at timestamptz;
alter table public.journal_entries enable row level security;
alter table public.house_records enable row level security;
alter table public.house_state enable row level security;
revoke all on public.journal_entries,public.house_records,public.house_state from anon,authenticated;
grant select,insert,update,delete on public.journal_entries,public.house_records,public.house_state to authenticated;
create policy owner on public.journal_entries for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy owner on public.house_records for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy owner on public.house_state for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
