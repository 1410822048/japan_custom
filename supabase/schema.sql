-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Cleanup (WARN: Deletes all data)
drop table if exists public.travel_notes cascade;
drop table if exists public.expenses cascade;
drop table if exists public.itinerary_items cascade;
drop table if exists public.trip_members cascade;
drop table if exists public.trips cascade;
drop type if exists public.expense_category cascade;
drop function if exists public.is_trip_member cascade;

-- Trips Table
create table public.trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null, -- Owner
  title text not null,
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trip Members Table (for shared access)
create table public.trip_members (
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text default 'member', -- owner, editor, viewer
  primary key (trip_id, user_id)
);

-- Itinerary Items Table
create table public.itinerary_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_number int not null,
  sort_order int not null,
  place_name text not null,
  lat float,
  lng float,
  google_place_id text,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense Categories Enum
create type public.expense_category as enum ('食', '衣', '住', '行', '其他');

-- Expenses Table
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  category public.expense_category not null default '其他',
  amount_jpy numeric,
  amount_twd numeric,
  description text,
  expense_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Travel Notes Table
create table public.travel_notes (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  content_md text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.expenses enable row level security;
alter table public.travel_notes enable row level security;

-- RLS Policies

-- Helper function to check membership
create or replace function public.is_trip_member(_trip_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.trip_members
    where trip_id = _trip_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Trips Policies
-- View: If you are the owner OR a member
create policy "Users can view trips they are members of"
  on public.trips for select
  using (
    auth.uid() = user_id -- Owner
    or
    exists (
      select 1 from public.trip_members
      where trip_id = public.trips.id
      and user_id = auth.uid()
    )
  );

-- Insert: Authenticated users can create trips
create policy "Users can create trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

-- Update: Members can update (simplified for "all members edit")
create policy "Members can update trips"
  on public.trips for update
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.trip_members
      where trip_id = public.trips.id
      and user_id = auth.uid()
    )
  );

-- Delete: Only owner can delete (optional choice, safer)
create policy "Owners can delete trips"
  on public.trips for delete
  using (auth.uid() = user_id);


-- Trip Members Policies
-- View: Members can view other members of the same trip
create policy "Members can view trip members"
  on public.trip_members for select
  using (
    public.is_trip_member(trip_id)
  );

-- Insert: Only existing members (or owner) can add new members? 
-- Or maybe anyone can join? Usually invite based. 
-- For now: Allow if user is already a member (invite logic needed in app) or if creating self (unlikely).
-- Let's allow any member to add others for this "6 person trusted group".
create policy "Members can add new members"
  on public.trip_members for insert
  with check (
    public.is_trip_member(trip_id)
  );
  
-- Also allow the owner to add themselves automatically upon trip creation?
-- Actually, we need a trigger or client logic to add the creator to trip_members.
-- The `trips` insert policy handles the trip.
-- We might need a policy for the creator to insert themselves into `trip_members`.
create policy "Users can join a trip if they are the owner"
  on public.trip_members for insert
  with check (
    user_id = auth.uid()
    and exists (
        select 1 from public.trips
        where id = trip_id and user_id = auth.uid()
    )
  );


-- Child Tables (Itinerary, Expenses, Notes)
-- View/Insert/Update/Delete based on membership of parent trip

-- Itinerary
create policy "Members can view itinerary"
  on public.itinerary_items for select
  using (public.is_trip_member(trip_id));

create policy "Members can insert itinerary"
  on public.itinerary_items for insert
  with check (public.is_trip_member(trip_id));

create policy "Members can update itinerary"
  on public.itinerary_items for update
  using (public.is_trip_member(trip_id));

create policy "Members can delete itinerary"
  on public.itinerary_items for delete
  using (public.is_trip_member(trip_id));

-- Expenses
create policy "Members can view expenses"
  on public.expenses for select
  using (public.is_trip_member(trip_id));

create policy "Members can insert expenses"
  on public.expenses for insert
  with check (public.is_trip_member(trip_id));

create policy "Members can update expenses"
  on public.expenses for update
  using (public.is_trip_member(trip_id));

create policy "Members can delete expenses"
  on public.expenses for delete
  using (public.is_trip_member(trip_id));

-- Travel Notes
create policy "Members can view notes"
  on public.travel_notes for select
  using (public.is_trip_member(trip_id));

create policy "Members can insert notes"
  on public.travel_notes for insert
  with check (public.is_trip_member(trip_id));

create policy "Members can update notes"
  on public.travel_notes for update
  using (public.is_trip_member(trip_id));

create policy "Members can delete notes"
  on public.travel_notes for delete
  using (public.is_trip_member(trip_id));

-- Add cover_image_url to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Storage Bucket setup for trip covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip-covers', 'trip-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access to Trip Covers"
ON storage.objects FOR SELECT
USING ( bucket_id = 'trip-covers' );

CREATE POLICY "Authenticated users can upload trip covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'trip-covers' AND (storage.foldername(name))[1] = 'trip-covers' );

CREATE POLICY "Users can update their own trip covers"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'trip-covers' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own trip covers"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'trip-covers' AND auth.uid() = owner );
