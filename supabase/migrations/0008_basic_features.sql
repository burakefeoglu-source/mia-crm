-- Bildirim tercihi
alter table team_members add column whatsapp_notifications_enabled boolean not null default true;

-- İzin/müsaitlik takibi
create table team_leaves (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid references team_members(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now()
);
alter table team_leaves enable row level security;
create policy "authenticated_full_access" on team_leaves for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Tekrarlayan görevleri gruplamak için (ileride toplu düzenleme/silme için kullanılabilir)
alter table tasks add column repeat_group_id uuid;
