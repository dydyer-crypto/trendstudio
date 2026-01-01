
create table api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  provider text not null, -- 'openai', 'anthropic', 'djaboo'
  key_name text not null,
  encrypted_key text not null, -- In a real app, ensure this is actually encrypted in app logic
  is_active boolean default true,
  usage_count integer default 0,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table webhooks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  url text not null,
  events text[], -- Array of event names
  is_active boolean default true,
  secret text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table api_keys enable row level security;
alter table webhooks enable row level security;

-- Policies for api_keys
create policy "Users can view their own api keys"
  on api_keys for select
  using (auth.uid() = user_id);

create policy "Users can create their own api keys"
  on api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own api keys"
  on api_keys for update
  using (auth.uid() = user_id);

create policy "Users can delete their own api keys"
  on api_keys for delete
  using (auth.uid() = user_id);

-- Policies for webhooks
create policy "Users can view their own webhooks"
  on webhooks for select
  using (auth.uid() = user_id);

create policy "Users can create their own webhooks"
  on webhooks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own webhooks"
  on webhooks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own webhooks"
  on webhooks for delete
  using (auth.uid() = user_id);
