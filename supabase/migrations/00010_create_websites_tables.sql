
create table websites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  domain text,
  template text not null,
  status text default 'draft', -- 'draft', 'published', 'maintenance'
  seo_config jsonb default '{}',
  design_config jsonb default '{}',
  pages jsonb default '[]',
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table website_pages (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid references websites(id) on delete cascade not null,
  title text not null,
  slug text not null,
  content jsonb default '{}',
  seo_title text,
  seo_description text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table websites enable row level security;
alter table website_pages enable row level security;

-- Policies for websites
create policy "Users can view their own websites"
  on websites for select
  using (auth.uid() = user_id);

create policy "Users can create their own websites"
  on websites for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own websites"
  on websites for update
  using (auth.uid() = user_id);

create policy "Users can delete their own websites"
  on websites for delete
  using (auth.uid() = user_id);

-- Policies for website_pages
-- Note: website_pages don't have user_id directly, so we check via the website linkage
create policy "Users can view their own site pages"
  on website_pages for select
  using (exists (select 1 from websites w where w.id = website_pages.website_id and w.user_id = auth.uid()));

create policy "Users can create pages for their own sites"
  on website_pages for insert
  with check (exists (select 1 from websites w where w.id = website_pages.website_id and w.user_id = auth.uid()));

create policy "Users can update pages for their own sites"
  on website_pages for update
  using (exists (select 1 from websites w where w.id = website_pages.website_id and w.user_id = auth.uid()));

create policy "Users can delete pages for their own sites"
  on website_pages for delete
  using (exists (select 1 from websites w where w.id = website_pages.website_id and w.user_id = auth.uid()));

-- Trigger for updated_at
create trigger handle_updated_at before update on websites
  for each row execute procedure moddatetime (updated_at);
