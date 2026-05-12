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
