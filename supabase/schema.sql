-- HabitBank schema. Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locked_amount numeric not null default 12000,
  withdrawable_amount numeric not null default 0
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  value_huf numeric not null,
  type text not null default 'daily' check (type in ('daily', 'custom')),
  scheduled_dates date[] not null default '{}',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.habits enable row level security;
alter table public.checkins enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can view own balance" on public.balances;
create policy "Users can view own balance" on public.balances for select using (auth.uid() = user_id);
drop policy if exists "Users can update own balance" on public.balances;
create policy "Users can update own balance" on public.balances for update using (auth.uid() = user_id);

drop policy if exists "Users can view own habits" on public.habits;
create policy "Users can view own habits" on public.habits for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own habits" on public.habits;
create policy "Users can insert own habits" on public.habits for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own habits" on public.habits;
create policy "Users can update own habits" on public.habits for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own habits" on public.habits;
create policy "Users can delete own habits" on public.habits for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own checkins" on public.checkins;
create policy "Users can view own checkins" on public.checkins for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own checkins" on public.checkins;
create policy "Users can insert own checkins" on public.checkins for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own checkins" on public.checkins;
create policy "Users can delete own checkins" on public.checkins for delete using (auth.uid() = user_id);

-- Auto-create a profile + starting balance whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.balances (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Supabase runs signups as the supabase_auth_admin role, which needs explicit
-- access to the public schema/tables the trigger above writes to. Without
-- this, signup fails with a 500 "Database error saving new user".
grant usage on schema public to supabase_auth_admin;
grant insert, select on public.profiles to supabase_auth_admin;
grant insert, select on public.balances to supabase_auth_admin;
