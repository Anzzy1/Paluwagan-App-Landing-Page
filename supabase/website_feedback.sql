-- Run once in Supabase → SQL Editor (same project as the Paluwagan app).
-- Stores feedback sent from the download website. Visitors can only INSERT; nobody can read it through the API.

create table if not exists public.website_feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  category    text not null check (category in ('bug', 'idea', 'design', 'other')),
  rating      smallint check (rating between 1 and 5),
  message     text not null check (char_length(message) between 3 and 2000),
  contact     text check (char_length(contact) <= 200),
  page        text check (char_length(page) <= 300),
  user_agent  text check (char_length(user_agent) <= 400)
);

alter table public.website_feedback enable row level security;

drop policy if exists "anyone can send feedback" on public.website_feedback;
create policy "anyone can send feedback"
  on public.website_feedback for insert
  to anon, authenticated
  with check (true);

-- Read feedback in the dashboard: Table Editor → website_feedback
-- or: select * from public.website_feedback order by created_at desc;
