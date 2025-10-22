-- Create programs table
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text not null,
  long_description text not null,
  category text not null,
  price decimal(10, 2),
  is_free boolean default false,
  image_url text,
  videos jsonb default '[]'::jsonb,
  additional_images jsonb default '[]'::jsonb,
  file_url text,
  created_by text not null,
  created_at timestamp with time zone default now()
);

-- Create announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.programs enable row level security;
alter table public.announcements enable row level security;

-- Create policies for programs (public read, no auth required)
create policy "Anyone can view programs"
  on public.programs for select
  using (true);

create policy "Anyone can insert programs"
  on public.programs for insert
  with check (true);

create policy "Anyone can update programs"
  on public.programs for update
  using (true);

create policy "Anyone can delete programs"
  on public.programs for delete
  using (true);

-- Create policies for announcements (public read, no auth required)
create policy "Anyone can view announcements"
  on public.announcements for select
  using (true);

create policy "Anyone can insert announcements"
  on public.announcements for insert
  with check (true);

create policy "Anyone can update announcements"
  on public.announcements for update
  using (true);

create policy "Anyone can delete announcements"
  on public.announcements for delete
  using (true);
