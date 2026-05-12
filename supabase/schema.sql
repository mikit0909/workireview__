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

create or replace view public.businesses_with_stats as
select
  b.id,
  b.name,
  b.city,
  b.category,
  b.category_other,
  b.area,
  b.street,
  b.station,
  b.rent,
  b.room_type,
  b.user_id,
  b.created_at,
  round(avg(r.rating)::numeric, 1) as avg_rating,
  count(r.id)::integer as review_count
from public.businesses b
left join public.reviews r on r.business_id = b.id
group by b.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1),
    'WorkiReview User'
  );

  insert into public.profiles (id, nickname)
  values (new.id, display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "businesses are viewable by everyone" on public.businesses;
create policy "businesses are viewable by everyone"
  on public.businesses for select
  using (true);

drop policy if exists "authenticated users can insert businesses" on public.businesses;
create policy "authenticated users can insert businesses"
  on public.businesses for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can update own businesses" on public.businesses;
create policy "users can update own businesses"
  on public.businesses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own businesses" on public.businesses;
create policy "users can delete own businesses"
  on public.businesses for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "reviews are viewable by everyone" on public.reviews;
create policy "reviews are viewable by everyone"
  on public.reviews for select
  using (true);

drop policy if exists "authenticated users can insert reviews" on public.reviews;
create policy "authenticated users can insert reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can update own reviews" on public.reviews;
create policy "users can update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own reviews" on public.reviews;
create policy "users can delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can view own favorites" on public.favorites;
create policy "users can view own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own favorites" on public.favorites;
create policy "users can insert own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own favorites" on public.favorites;
create policy "users can delete own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.businesses, public.reviews, public.businesses_with_stats to anon, authenticated;
grant insert, update, delete on public.profiles, public.businesses, public.reviews, public.favorites to authenticated;
grant select on public.favorites to authenticated;
