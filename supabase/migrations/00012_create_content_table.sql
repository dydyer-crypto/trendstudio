
create table generated_content (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  content_type text not null, -- 'article', 'page', 'product', 'meta'
  title text not null,
  content text,
  seo_optimized boolean default false,
  word_count integer,
  ai_model text,
  prompt_used text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table generated_content enable row level security;

-- Policies
create policy "Users can view their own generated content"
  on generated_content for select
  using (auth.uid() = user_id);

create policy "Users can create their own generated content"
  on generated_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generated content"
  on generated_content for update
  using (auth.uid() = user_id);

create policy "Users can delete their own generated content"
  on generated_content for delete
  using (auth.uid() = user_id);
