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
