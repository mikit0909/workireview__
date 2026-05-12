create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  city text not null check (
    city in (
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Gold Coast',
      'Perth',
      'Adelaide',
      'Cairns',
      'Darwin',
      'Tasmania',
      'Canberra',
      'Broome',
      'Sunshine Coast',
      'Gatton'
    )
  ),
  category text not null check (category in ('house', 'job', 'other')),
  category_other text,
  area text,
  street text,
  station text,
  rent text,
  room_type text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint category_other_required check (
    category <> 'other' or char_length(trim(coalesce(category_other, ''))) > 0
  )
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  work_started_on date,
  work_ended_on date,
  visa_2nd_3rd boolean not null default false,
  comment text not null check (char_length(trim(comment)) >= 5),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);

create index if not exists businesses_city_idx on public.businesses(city);
create index if not exists businesses_category_idx on public.businesses(category);
create index if not exists businesses_name_idx on public.businesses using gin (to_tsvector('simple', name));
create index if not exists reviews_business_id_idx on public.reviews(business_id);
create index if not exists favorites_user_id_idx on public.favorites(user_id);
