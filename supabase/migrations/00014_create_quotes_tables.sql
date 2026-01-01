
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  client_name text not null,
  client_email text,
  project_type text not null,
  services jsonb default '[]',
  total_amount decimal(10,2) not null,
  status text default 'draft', -- 'draft', 'sent', 'accepted', 'rejected'
  valid_until date,
  notes text,
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone,
  accepted_at timestamp with time zone
);

create table quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade not null,
  description text not null,
  quantity integer default 1,
  unit_price decimal(10,2) not null,
  total decimal(10,2) not null
);

-- Enable RLS
alter table quotes enable row level security;
alter table quote_items enable row level security;

-- Policies
create policy "Users can view their own quotes"
  on quotes for select
  using (auth.uid() = user_id);

create policy "Users can create their own quotes"
  on quotes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own quotes"
  on quotes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own quotes"
  on quotes for delete
  using (auth.uid() = user_id);

create policy "Users can view their own quote items"
  on quote_items for select
  using (exists (select 1 from quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid()));

create policy "Users can create their own quote items"
  on quote_items for insert
  with check (exists (select 1 from quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid()));

create policy "Users can delete their own quote items"
  on quote_items for delete
  using (exists (select 1 from quotes where quotes.id = quote_items.quote_id and quotes.user_id = auth.uid()));
