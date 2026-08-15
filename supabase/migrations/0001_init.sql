-- Mia Digital Solutions — CRM MVP şeması
-- Modüller: Görev Takibi, Çekim Takvimi, Google Drive bağlantısı, Influencer + Kampanya

create extension if not exists "pgcrypto";

-- ============ Müşteriler ============
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text check (sector in ('fnb', 'hotel', 'jewelry', 'other')) default 'other',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ Ekip ============
create table team_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role text check (role in ('video', 'edit', 'design', 'social', 'brand_management')) not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============ Görevler ============
create table tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  assigned_to uuid references team_members(id) on delete set null,
  title text not null,
  description text,
  task_date date not null,
  start_time time not null,
  duration_minutes integer not null default 60,
  status text check (status in ('todo', 'in_progress', 'revision', 'done')) not null default 'todo',
  created_at timestamptz not null default now()
);
create index idx_tasks_date on tasks(task_date);
create index idx_tasks_assigned_to on tasks(assigned_to);

-- ============ Çekimler ============
create table shoots (
  id uuid primary key default gen_random_uuid(),
  shoot_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  shoot_type text check (shoot_type in ('video', 'photo')) not null default 'video',
  notes text,
  created_at timestamptz not null default now()
);
create index idx_shoots_date on shoots(shoot_date);

create table shoot_clients (
  shoot_id uuid references shoots(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  primary key (shoot_id, client_id)
);

create table shoot_team (
  shoot_id uuid references shoots(id) on delete cascade,
  team_member_id uuid references team_members(id) on delete cascade,
  primary key (shoot_id, team_member_id)
);

-- ============ Google Drive bağlı dosyalar ============
-- entity_type + entity_id ile hem tasks hem shoots'a bağlanabilir (polymorphic)
create table linked_files (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('task', 'shoot')) not null,
  entity_id uuid not null,
  google_file_id text not null,
  file_name text not null,
  file_url text not null,
  mime_type text,
  added_by uuid references team_members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_linked_files_entity on linked_files(entity_type, entity_id);

-- ============ Influencer'lar ============
create table influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  last_budget numeric(10, 2),
  notes text,
  created_at timestamptz not null default now()
);

-- ============ Kampanyalar ============
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  title text not null,
  campaign_date date,
  status text check (status in ('planning', 'active', 'completed')) not null default 'planning',
  created_at timestamptz not null default now()
);

create table campaign_influencers (
  campaign_id uuid references campaigns(id) on delete cascade,
  influencer_id uuid references influencers(id) on delete cascade,
  budget numeric(10, 2),
  notes text,
  primary key (campaign_id, influencer_id)
);

-- ============ RLS ============
-- MVP: tek ajans / tek workspace. Giriş yapmış her kullanıcı tüm veriyi okur/yazar.
-- Çoklu ajans desteği gerekirse workspace_id kolonu + policy eklenir.
alter table clients enable row level security;
alter table team_members enable row level security;
alter table tasks enable row level security;
alter table shoots enable row level security;
alter table shoot_clients enable row level security;
alter table shoot_team enable row level security;
alter table linked_files enable row level security;
alter table influencers enable row level security;
alter table campaigns enable row level security;
alter table campaign_influencers enable row level security;

create policy "authenticated_full_access" on clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on team_members for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on tasks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on shoots for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on shoot_clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on shoot_team for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on linked_files for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on influencers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on campaigns for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on campaign_influencers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
