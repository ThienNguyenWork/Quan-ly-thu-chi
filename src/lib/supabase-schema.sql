-- ==============================================================================
-- SCHEMA POSTGRESQL & ROW LEVEL SECURITY (RLS) CHO SUPABASE
-- Ứng dụng: Sổ Thu Chi Cá Nhân
-- ==============================================================================

-- 1. Kích hoạt tiện ích mở rộng uuid-ossp (nếu chưa có)
create extension if not exists "uuid-ossp";

-- 2. Bảng Hồ Sơ Người Dùng (profiles)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text not null default '',
  currency text not null default 'VND',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = user_id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = user_id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = user_id);

-- 3. Bảng Danh Mục (categories)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_category text,
  icon text,
  type text not null check (type in ('expense', 'income')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS categories
alter table public.categories enable row level security;

create policy "Users can view own categories" 
  on public.categories for select 
  using (auth.uid() = user_id);

create policy "Users can insert own categories" 
  on public.categories for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own categories" 
  on public.categories for update 
  using (auth.uid() = user_id);

create policy "Users can delete own categories" 
  on public.categories for delete 
  using (auth.uid() = user_id);

-- 4. Bảng Giao Dịch Thu Chi (transactions)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  category text not null,
  subcategory text,
  amount numeric not null check (amount >= 0),
  type text not null check (type in ('expense', 'income')),
  description text not null,
  transaction_date date not null default current_date,
  payment_method text not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS transactions
alter table public.transactions enable row level security;

create policy "Users can view own transactions" 
  on public.transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
  on public.transactions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own transactions" 
  on public.transactions for update 
  using (auth.uid() = user_id);

create policy "Users can delete own transactions" 
  on public.transactions for delete 
  using (auth.uid() = user_id);

-- 5. Bảng Ngân Sách (budgets)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  category_name text not null,
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2000),
  amount numeric not null check (amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS budgets
alter table public.budgets enable row level security;

create policy "Users can view own budgets" 
  on public.budgets for select 
  using (auth.uid() = user_id);

create policy "Users can insert own budgets" 
  on public.budgets for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own budgets" 
  on public.budgets for update 
  using (auth.uid() = user_id);

create policy "Users can delete own budgets" 
  on public.budgets for delete 
  using (auth.uid() = user_id);

-- 6. Trigger tự động tạo hồ sơ profile khi người dùng đăng ký mới
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, currency)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    'VND'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Gắn trigger vào auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
