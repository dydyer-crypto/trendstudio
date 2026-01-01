
create table agency_clients (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text,
  credits_allocated integer default 0,
  credits_used integer default 0,
  status text default 'active', -- 'active', 'suspended', 'inactive'
  created_at timestamp with time zone default now()
);

create table agency_team (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references profiles(id) on delete cascade not null,
  member_id uuid references profiles(id) on delete cascade,
  role text not null, -- 'admin', 'manager', 'member'
  permissions jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table agency_clients enable row level security;
alter table agency_team enable row level security;

-- Policies for agency_clients
create policy "Agencies can view their own clients"
  on agency_clients for select
  using (agency_id = auth.uid());

create policy "Agencies can create their own clients"
  on agency_clients for insert
  with check (agency_id = auth.uid());

create policy "Agencies can update their own clients"
  on agency_clients for update
  using (agency_id = auth.uid());

create policy "Agencies can delete their own clients"
  on agency_clients for delete
  using (agency_id = auth.uid());

-- Policies for agency_team
create policy "Agencies can view their own team"
  on agency_team for select
  using (agency_id = auth.uid());

create policy "Agencies can manage their own team"
  on agency_team for all
  using (agency_id = auth.uid());
