-- Örnek veri — panelleri dolu görmek için. Prod'a geçmeden önce silinebilir.
-- NOT: Bu dosyayı SADECE 0004_faz1_revisions.sql çalıştırıldıktan SONRA çalıştırın.

insert into clients (id, name, sector, is_active, address, instagram_handle) values
  ('11111111-1111-1111-1111-111111111111', 'Lagune Otel', 'hotel', true, 'Beşiktaş, İstanbul', '@laguneotel'),
  ('22222222-2222-2222-2222-222222222222', 'Nero Jewelry', 'jewelry', true, 'Nişantaşı, İstanbul', '@nerojewelry'),
  ('33333333-3333-3333-3333-333333333333', 'Levant F&B', 'fnb', true, 'Karaköy, İstanbul', '@levantfnb')
on conflict (id) do nothing;

insert into team_members (id, name, role, email, phone) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ece Kaya', 'edit', 'ece@miadigital.com', '+90 532 000 00 01'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Berk Toprak', 'social', 'berk@miadigital.com', '+90 532 000 00 02'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Selin Demir', 'design', 'selin@miadigital.com', '+90 532 000 00 03'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Can Aydın', 'video', 'can@miadigital.com', '+90 532 000 00 04')
on conflict (id) do nothing;

insert into tasks (id, client_id, title, task_date, start_time, duration_minutes, duration_preset, status) values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Reels kurgu', current_date, '10:00', 120, 'custom', 'in_progress'),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'İçerik takvimi', current_date, '13:00', 90, 'custom', 'revision'),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Menü fotoğrafları düzenleme', current_date, '15:00', 120, 'custom', 'done'),
  ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Lobi çekimi ön hazırlık', current_date + 1, '09:00', 480, 'full_day', 'todo')
on conflict (id) do nothing;

insert into task_assignees (task_id, team_member_id) values
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('a2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
on conflict do nothing;

insert into shoots (id, title, shoot_date, start_time, end_time, location, shoot_type, notes) values
  ('99999999-9999-9999-9999-999999999999', 'Lagune Otel — tanıtım videosu', current_date, '16:00', '18:00', 'Beşiktaş', 'video', 'Tanıtım videosu'),
  ('88888888-8888-8888-8888-888888888888', 'Nero Jewelry — ürün çekimi', current_date + 1, '10:30', '12:30', 'Nişantaşı', 'photo', 'Ürün çekimi')
on conflict (id) do nothing;

insert into shoot_clients (shoot_id, client_id) values
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222')
on conflict do nothing;

insert into shoot_team (shoot_id, team_member_id) values
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
on conflict do nothing;

insert into influencers (id, name, nickname, instagram_url, tiktok_url, last_budget) values
  ('77777777-7777-7777-7777-777777777777', 'Deniz Aksoy', 'denizgezer', 'https://instagram.com/denizgezer', null, 15000),
  ('66666666-6666-6666-6666-666666666666', 'Ela Yıldız', 'elastyle', 'https://instagram.com/elastyle', 'https://tiktok.com/@elastyle', 22000)
on conflict (id) do nothing;

insert into campaigns (id, client_id, title, campaign_date, status) values
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Lagune Otel Yaz Kampanyası', current_date + 14, 'planning')
on conflict (id) do nothing;

insert into campaign_influencers (campaign_id, influencer_id, budget) values
  ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 15000),
  ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 20000)
on conflict do nothing;
