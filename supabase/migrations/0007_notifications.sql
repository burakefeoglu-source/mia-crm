-- Uygulama içi bildirimler (görev/çekim atandığında).
create table notifications (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid references team_members(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;
create policy "authenticated_full_access" on notifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter publication supabase_realtime add table notifications;
