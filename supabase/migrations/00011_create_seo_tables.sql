
create table seo_analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  website_id uuid references websites(id) on delete cascade,
  url text not null,
  rankings jsonb default '{}',
  on_page_score integer,
  technical_score integer,
  backlinks_count integer default 0,
  issues jsonb default '[]',
  opportunities jsonb default '[]',
  created_at timestamp with time zone default now()
);

create table keyword_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  website_id uuid references websites(id) on delete cascade,
  keyword text not null,
  position integer,
  search_volume integer,
  difficulty integer,
  tracked_at timestamp with time zone default now()
);

-- Enable RLS
alter table seo_analyses enable row level security;
alter table keyword_tracking enable row level security;

-- Policies
create policy "Users can view their own seo analyses"
  on seo_analyses for select
  using (auth.uid() = user_id);

create policy "Users can create their own seo analyses"
  on seo_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own seo analyses"
  on seo_analyses for delete
  using (auth.uid() = user_id);

create policy "Users can view their own keyword tracking"
  on keyword_tracking for select
  using (auth.uid() = user_id);

create policy "Users can create their own keyword tracking"
  on keyword_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own keyword tracking"
  on keyword_tracking for delete
  using (auth.uid() = user_id);
