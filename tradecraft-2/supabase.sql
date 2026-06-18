-- Run this in Supabase → SQL Editor once.
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  role text,
  annotation jsonb not null,
  created_at timestamptz default now()
);

-- Public profiles are readable by anyone with the link.
alter table profiles enable row level security;

create policy "public read" on profiles
  for select using (true);

-- Writes only happen server-side with the service_role key, which bypasses RLS,
-- so no insert policy is needed for anon users.
