
create table site_audits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  website_id uuid references websites(id) on delete cascade,
  url text not null,
  audit_type text not null, -- 'seo', 'performance', 'security', 'full'
  results jsonb default '{}',
  score integer,
  issues jsonb default '[]',
  recommendations jsonb default '[]',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table site_audits enable row level security;

-- Policies
create policy "Users can view their own site audits"
  on site_audits for select
  using (auth.uid() = user_id);

create policy "Users can create their own site audits"
  on site_audits for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own site audits"
  on site_audits for delete
  using (auth.uid() = user_id);
