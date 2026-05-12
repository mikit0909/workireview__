alter table public.reviews
  add column if not exists work_started_on date,
  add column if not exists work_ended_on date,
  add column if not exists visa_2nd_3rd boolean not null default false;
