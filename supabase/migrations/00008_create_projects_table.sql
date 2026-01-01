create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  type text not null, -- 'content', 'website', 'seo', 'redesign'
  status text default 'draft', -- 'draft', 'active', 'completed', 'archived'
  settings jsonb default '{}',
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table projects enable row level security;

-- Policies
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger handle_updated_at before update on projects
  for each row execute procedure moddatetime (updated_at);
