-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Additional RLS policies for Supabase auth integration

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Reviews policies
create policy "Anyone can view approved reviews"
  on reviews for select
  using (status = 'approved');

create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on reviews for update
  using (auth.uid() = user_id);

-- Business photos policies
create policy "Anyone can view approved business photos"
  on business_photos for select
  using (approved = true);

create policy "Business owners can manage their photos"
  on business_photos for all
  using (
    exists (
      select 1 from businesses
      where businesses.id = business_photos.business_id
      and businesses.owner_id = auth.uid()
    )
  );

-- Business claims policies
create policy "Users can view their own claims"
  on business_claims for select
  using (auth.uid() = user_id);

create policy "Users can create claims"
  on business_claims for insert
  with check (auth.uid() = user_id);

-- Create function to handle user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Function to update review counts
create or replace function update_review_counts()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update profiles
    set review_count = review_count + 1
    where id = new.user_id;
  elsif (tg_op = 'DELETE') then
    update profiles
    set review_count = review_count - 1
    where id = old.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for review counts
create trigger on_review_change
  after insert or delete on reviews
  for each row execute function update_review_counts();

-- Function to handle helpful votes
create or replace function handle_helpful_vote()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update reviews
    set helpful_votes = helpful_votes + 1
    where id = new.review_id;
    
    update profiles
    set helpful_votes_count = helpful_votes_count + 1
    where id = (select user_id from reviews where id = new.review_id);
  elsif (tg_op = 'DELETE') then
    update reviews
    set helpful_votes = helpful_votes - 1
    where id = old.review_id;
    
    update profiles
    set helpful_votes_count = helpful_votes_count - 1
    where id = (select user_id from reviews where id = old.review_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for helpful votes
create trigger on_helpful_vote_change
  after insert or delete on review_helpful_votes
  for each row execute function handle_helpful_vote();

-- Function to generate slug from business name
create or replace function generate_slug(name text)
returns text as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'),
      '^-+|-+$',
      '',
      'g'
    )
  );
end;
$$ language plpgsql immutable;

-- Function to ensure unique slug
create or replace function ensure_unique_business_slug()
returns trigger as $$
declare
  base_slug text;
  new_slug text;
  counter integer;
begin
  -- Generate the base slug
  base_slug := generate_slug(new.name);
  new_slug := base_slug;
  counter := 1;
  
  -- Keep checking until we find a unique slug
  while exists(select 1 from businesses where slug = new_slug and id != new.id) loop
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;
  
  new.slug := new_slug;
  return new;
end;
$$ language plpgsql;

-- Trigger for unique business slug
create trigger ensure_unique_business_slug_trigger
  before insert or update on businesses
  for each row execute function ensure_unique_business_slug();

-- Function to calculate average rating
create or replace function calculate_business_rating(business_id bigint)
returns numeric as $$
declare
  avg_rating numeric;
begin
  select coalesce(avg(rating), 0)
  into avg_rating
  from reviews
  where business_id = $1
  and status = 'approved';
  
  return round(avg_rating, 1);
end;
$$ language plpgsql;

-- Create view for business statistics
create or replace view business_statistics as
select
  b.id,
  b.name,
  b.status,
  count(distinct r.id) as review_count,
  calculate_business_rating(b.id) as average_rating,
  count(distinct bp.id) as photo_count
from businesses b
left join reviews r on r.business_id = b.id and r.status = 'approved'
left join business_photos bp on bp.business_id = b.id and bp.approved = true
group by b.id;

-- Add indexes for search
create index idx_businesses_name_gin on businesses using gin(name gin_trgm_ops);
create index idx_businesses_description_gin on businesses using gin(description gin_trgm_ops);

-- Enable full text search
alter table businesses add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

create index idx_businesses_search on businesses using gin(search_vector);