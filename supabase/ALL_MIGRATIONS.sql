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
