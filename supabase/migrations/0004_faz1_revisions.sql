-- Faz 1 UI revizeleri için şema güncellemesi

-- Görevler: çoklu atanan kişi desteği (tek assigned_to yerine ara tablo)
create table task_assignees (
  task_id uuid references tasks(id) on delete cascade,
  team_member_id uuid references team_members(id) on delete cascade,
  primary key (task_id, team_member_id)
);
alter table task_assignees enable row level security;
create policy "authenticated_full_access" on task_assignees for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Mevcut assigned_to verisini task_assignees'e taşı, sonra kolonu bırak
insert into task_assignees (task_id, team_member_id)
select id, assigned_to from tasks where assigned_to is not null;

alter table tasks drop column assigned_to;

-- Görevler: bitiş presetleri (yarım gün / 1 gün / 2 gün / özel)
alter table tasks add column duration_preset text
  check (duration_preset in ('custom', 'half_day', 'full_day', 'two_days')) default 'custom';

-- Çekimler: başlık ve Google konum bilgisi
alter table shoots add column title text;
alter table shoots add column place_id text;      -- Google Places place_id
alter table shoots add column latitude numeric;
alter table shoots add column longitude numeric;
alter table shoots add column is_outdoor boolean default false;

-- Müşteriler: Drive linki, konum, marka kiti, sosyal medya
alter table clients add column drive_url text;
alter table clients add column address text;
alter table clients add column place_id text;
alter table clients add column logo_url text;
alter table clients add column brand_colors text[];
alter table clients add column brand_fonts text;
alter table clients add column brand_guide_url text;
alter table clients add column instagram_handle text;
alter table clients add column tiktok_handle text;

-- Ekip: telefon ve profil fotoğrafı (WhatsApp entegrasyonu için telefon önemli)
alter table team_members add column phone text;
alter table team_members add column avatar_url text;

-- Notlar (panel için basit not defteri)
create table notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_by uuid references team_members(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table notes enable row level security;
create policy "authenticated_full_access" on notes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
