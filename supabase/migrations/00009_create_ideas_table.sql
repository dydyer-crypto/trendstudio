create table ideas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  category text, -- 'video', 'article', 'social', 'website'
  keywords text[],
  trend_score integer default 0,
  is_favorite boolean default false,
  status text default 'idea', -- 'idea', 'planned', 'in_progress', 'published'
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table ideas enable row level security;

-- Policies
create policy "Users can view their own ideas"
  on ideas for select
  using (auth.uid() = user_id);

create policy "Users can create their own ideas"
  on ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ideas"
  on ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ideas"
  on ideas for delete
  using (auth.uid() = user_id);
