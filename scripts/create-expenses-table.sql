-- Create expenses table
create table if not exists public.expenses (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null default auth.uid(),
    amount decimal(10, 2) not null,
    category text not null check (category in ('Rent', 'Products / Stock', 'Transport', 'Utilities', 'Other')),
    description text,
    date date not null default current_date,
    created_at timestamptz not null default now(),
    
    constraint expenses_pkey primary key (id),
    constraint expenses_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.expenses enable row level security;

-- Policies
create policy "Users can view their own expenses"
    on public.expenses for select
    using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
    on public.expenses for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
    on public.expenses for update
    using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
    on public.expenses for delete
    using (auth.uid() = user_id);
