-- WhatsApp üzerinden gelen görev mesajlarının kaydı (denetim/hata ayıklama için).
create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  from_number text not null,
  raw_text text not null,
  parsed_task_id uuid references tasks(id) on delete set null,
  status text check (status in ('received', 'created', 'failed', 'clarification_needed')) not null default 'received',
  reply_text text,
  created_at timestamptz not null default now()
);

alter table whatsapp_messages enable row level security;
create policy "authenticated_full_access" on whatsapp_messages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- Not: webhook service_role key ile yazdığı için bu policy'e tabi değil (RLS bypass eder).
