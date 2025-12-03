-- Alternative: Custom password storage table (if not using Supabase Auth's built-in password management)
-- This is optional and only needed if you want to manage passwords completely separately

create table if not exists public.user_credentials (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for user_credentials
alter table public.user_credentials enable row level security;

-- Only allow users to view/update their own credentials
create policy "Users can view own credentials" on public.user_credentials for select using (auth.uid() = user_id);
create policy "Users can update own credentials" on public.user_credentials for update using (auth.uid() = user_id);

-- System can insert credentials (for registration)
create policy "System can insert credentials" on public.user_credentials for insert with check (true);
