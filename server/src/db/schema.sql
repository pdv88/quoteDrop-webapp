-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (extends Supabase auth.users if needed, or standalone)
-- Note: Supabase handles auth, but we might want a public profiles table.
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  company_name text,
  phone text,
  logo_url text,
  subscription_tier text default 'free', -- 'free' or 'premium'
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients Table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services Table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  unit_cost numeric not null,
  unit_type text default 'hour', -- hour, item, flat, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quotes Table
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  quote_number serial, -- Simple auto-increment for display
  status text default 'draft', -- draft, sent, accepted, rejected, paid, partial
  total_amount numeric default 0,
  valid_until date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quote Items Table
create table public.quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null, -- Optional link to service
  description text not null,
  quantity numeric default 1,
  unit_cost numeric not null,
  total numeric generated always as (quantity * unit_cost) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Clients policies
create policy "Users can view own clients" on public.clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = user_id);

-- Services policies
create policy "Users can view own services" on public.services for select using (auth.uid() = user_id);
create policy "Users can insert own services" on public.services for insert with check (auth.uid() = user_id);
create policy "Users can update own services" on public.services for update using (auth.uid() = user_id);
create policy "Users can delete own services" on public.services for delete using (auth.uid() = user_id);

-- Quotes policies
create policy "Users can view own quotes" on public.quotes for select using (auth.uid() = user_id);
create policy "Users can insert own quotes" on public.quotes for insert with check (auth.uid() = user_id);
create policy "Users can update own quotes" on public.quotes for update using (auth.uid() = user_id);
create policy "Users can delete own quotes" on public.quotes for delete using (auth.uid() = user_id);

-- Quote Items policies
create policy "Users can view own quote items" on public.quote_items for select using (
  exists ( select 1 from public.quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid() )
);
create policy "Users can insert own quote items" on public.quote_items for insert with check (
  exists ( select 1 from public.quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid() )
);
create policy "Users can update own quote items" on public.quote_items for update using (
  exists ( select 1 from public.quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid() )
);
create policy "Users can delete own quote items" on public.quote_items for delete using (
  exists ( select 1 from public.quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid() )
);

-- Functions
-- Function to handle new user signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
