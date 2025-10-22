-- Create settings table for site configuration
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.settings enable row level security;

-- Create policies for settings
create policy "Anyone can view settings"
  on public.settings for select
  using (true);

create policy "Anyone can insert settings"
  on public.settings for insert
  with check (true);

create policy "Anyone can update settings"
  on public.settings for update
  using (true);

-- Insert default Discord link
insert into public.settings (key, value)
values ('discord_link', 'https://discord.gg/yourserver')
on conflict (key) do nothing;
