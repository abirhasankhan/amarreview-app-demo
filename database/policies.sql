-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Additional RLS policies for Supabase auth integration


create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);




-- Policy: SELECT — Read own files
CREATE POLICY "Users can read their own avatar files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND split_part(name, '/', 1) = auth.uid()::text
);


-- Policy: UPDATE — Modify own files
CREATE POLICY "Users can update their own avatar files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND split_part(name, '/', 1) = auth.uid()::text
);


-- Policy: DELETE — Delete own files
CREATE POLICY "Users can delete their own avatar files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND split_part(name, '/', 1) = auth.uid()::text
);


-- Policy Name: "Authenticated users can update their own profile"
CREATE POLICY "Authenticated users can update their own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

-- SELECT policy
CREATE POLICY "Users can select their own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

-- DELETE policy (optional)
CREATE POLICY "Users can delete their own profile"
ON profiles
FOR DELETE
USING (id = auth.uid());


-- Allow INSERT for authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Allow SELECT for anyone (optional public read access)
sql
Copy
Edit

CREATE POLICY "Allow select for everyone"
ON reviews
FOR SELECT
USING (true);

-- Allow UPDATE for review owners
CREATE POLICY "Allow update for review owner"
ON reviews
FOR UPDATE
USING (
  auth.uid() = user_id
);

-- Allow DELETE for review owner
CREATE POLICY "Allow delete for review owner"
ON reviews
FOR DELETE
USING (
  auth.uid() = user_id
);

-- a. Allow Insert (users can mark a review as helpful once)
create policy "Allow insert for authenticated users"
on review_helpful_votes
for insert
with check (
  auth.uid() = user_id
);


-- Allow Delete (users can remove their helpful vote)
create policy "Allow delete for vote owner"
on review_helpful_votes
for delete
using (
  auth.uid() = user_id
);

-- Allow Select (anyone can read helpful votes)
create policy "Allow read for all"
on review_helpful_votes
for select
using (true);

-- Allow Insert (users can report reviews)
create policy "Allow insert for authenticated users"
on review_reports
for insert
with check (
  auth.uid() = user_id
);

--  Allow Update (admin/moderator can change status)
create policy "Allow status update for admins"
on review_reports
for update
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Allow Delete (only admins can delete)
create policy "Allow delete for admins"
on review_reports
for delete
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Allow Select (admins and the user who reported)
create policy "Allow read for reporters and admins"
on review_reports
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Business policies
create policy "Public can read businesses"
on businesses
for select
to public
using (true);

-- Allow authenticated users to create businesses
create policy "Authenticated users can create businesses"
on businesses
for insert
to authenticated
with check (auth.uid() = owner_id);

-- Allow owners to update their businesses
create policy "Owners can update their businesses"
on businesses
for update
to authenticated
using (auth.uid() = owner_id);

-- Allow owners to delete their businesses
create policy "Owners can delete their businesses"
on businesses
for delete
to authenticated
using (auth.uid() = owner_id);


-- Allow authenticated users to create business claims
create policy "Users can submit business claims"
on business_claims
for insert
with check (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

-- Allow authenticated users to view their own business claims
create policy "Users can view their own claims"
on business_claims
for select
using (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);


-- Allow authenticated users to update their own business claims
create policy "Users can update their own pending claims"
on business_claims
for update
using (
  auth.role() = 'authenticated' AND auth.uid() = user_id AND status = 'pending'
)
with check (
  auth.role() = 'authenticated' AND auth.uid() = user_id AND status = 'pending'
);


-- Create storage bucket for verification documents
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false);

-- Set up access policies
create policy "Verification document upload"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-docs' and
    auth.role() = 'authenticated'
  );

create policy "Verification document access"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs' and
    auth.role() = 'authenticated'
  );


-- Allow authenticated users to manage their own files
create policy "User access to verification docs"
on storage.objects for all
using (
  bucket_id = 'verification-docs' and
  auth.uid() = owner
)
with check (
  bucket_id = 'verification-docs' and
  auth.uid() = owner
);


-- Allow specific MIME types
create policy "Verification document upload"
on storage.objects for insert
with check (
  bucket_id = 'verification-docs' AND
  auth.role() = 'authenticated' AND
  storage.content_type(objects.name) IN (
    'image/jpeg',
    'image/png',
    'application/pdf'
  )
);


-- Policy: Allow business owners to respond to reviews
create policy "Allow business owner to respond to a review"
on review_responses
for insert
with check (
  auth.uid() = user_id
);

-- Policy: Allow authors to view their own responses
create policy "Allow authors to view their responses"
on review_responses
for select
using (
  auth.uid() = user_id
);


-- Policy: Allow authors to update their own responses
create policy "Allow authors to update their responses"
on review_responses
for update
using (
  auth.uid() = user_id
);

-- Policy: Allow authors to delete their own responses
create policy "Allow authors to delete their responses"
on review_responses
for delete
using (
  auth.uid() = user_id
);

-- (Optional) Admin access to manage all

create policy "Admins can manage all responses"
on review_responses
for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);


-- Policy: Allow everyone to read (view)
create policy "Everyone can view review responses"
on review_responses
for select
using (true);


-- 🔒 Admin Full Access Policy
CREATE POLICY "Admins can do anything"
ON business_hours
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

--  Business Owner: SELECT Their Own Business Hours
CREATE POLICY "Business owners can view their business hours"
ON business_hours
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_hours.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Business Owner: INSERT Their Own Business Hours
CREATE POLICY "Business owners can insert hours for their business"
ON business_hours
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_hours.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Business Owner: UPDATE Their Own Business Hours
CREATE POLICY "Business owners can update their business hours"
ON business_hours
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_hours.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Business Owner: DELETE Their Own Business Hours
CREATE POLICY "Business owners can delete their business hours"
ON business_hours
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_hours.business_id
    AND businesses.owner_id = auth.uid()
  )
);



-- Allow users to view their own uploaded photos or view public/approved ones:
CREATE POLICY "Allow users to view their own or approved photos"
ON business_photos
FOR SELECT
USING (
  user_id = auth.uid() OR approved = true
);


-- Allow authenticated users to insert new photos where user_id is themselves:
CREATE POLICY "Allow authenticated users to insert photos"
ON business_photos
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

-- Allow users to update their own photo entries only:
CREATE POLICY "Allow users to update their own photos"
ON business_photos
FOR UPDATE
USING (
  user_id = auth.uid()
);


-- Allow users to delete their own photo entries:
CREATE POLICY "Allow users to delete their own photos"
ON business_photos
FOR DELETE
USING (
  user_id = auth.uid()
);


-- Storage policies
create policy "Business photo storage"
on storage.objects for insert
with check (
  bucket_id = 'business-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business photos table policies
create policy "Users can view their photos" 
on public.business_photos for select using (
  auth.uid() = user_id
);

create policy "Users can create photos"
on public.business_photos for insert with check (
  auth.uid() = user_id
);

create policy "Users can update their photos"
on public.business_photos for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);

create policy "Users can delete their photos"
on public.business_photos for delete using (
  auth.uid() = user_id
);

-- Create simple upload policy
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-photos'
);

-- Optional: Add read policy
create policy "Allow public reads"
on storage.objects
for select
using (
  bucket_id = 'business-photos'
);



-- Allow anyone to SELECT (public access)
create policy "Public can read FAQs"
on business_faqs
for select
using (true);

-- Allow INSERT for Business Owners Only
create policy "Allow business owner to insert FAQs"
on business_faqs
for insert
with check (
  exists (
    select 1 from businesses
    where businesses.id = business_faqs.business_id
    and businesses.owner_id = auth.uid()
  )
);

--  Allow UPDATE for Business Owners Only
create policy "Allow business owner to update FAQs"
on business_faqs
for update
using (
  exists (
    select 1 from businesses
    where businesses.id = business_faqs.business_id
    and businesses.owner_id = auth.uid()
  )
);


-- Allow DELETE for Business Owners Only
create policy "Allow business owner to delete FAQs"
on business_faqs
for delete
using (
  exists (
    select 1 from businesses
    where businesses.id = business_faqs.business_id
    and businesses.owner_id = auth.uid()
  )
);

---------------------------------------------------------------

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