-- Örnek veri — panelleri dolu görmek için. Prod'a geçmeden önce silinebilir.

insert into clients (id, name, sector, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Lagune Otel', 'hotel', true),
  ('22222222-2222-2222-2222-222222222222', 'Nero Jewelry', 'jewelry', true),
  ('33333333-3333-3333-3333-333333333333', 'Levant F&B', 'fnb', true);

insert into team_members (id, name, role, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ece Kaya', 'edit', 'ece@miadigital.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Berk Toprak', 'social', 'berk@miadigital.com'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Selin Demir', 'design', 'selin@miadigital.com'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Can Aydın', 'video', 'can@miadigital.com');

insert into tasks (client_id, assigned_to, title, task_date, start_time, duration_minutes, status) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reels kurgu', current_date, '10:00', 120, 'in_progress'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'İçerik takvimi', current_date, '13:00', 90, 'revision'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Menü fotoğrafları düzenleme', current_date, '15:00', 120, 'done'),
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lobi çekimi ön hazırlık', current_date + 1, '09:00', 60, 'todo');

insert into shoots (id, shoot_date, start_time, end_time, location, shoot_type, notes) values
  ('99999999-9999-9999-9999-999999999999', current_date, '16:00', '18:00', 'Beşiktaş', 'video', 'Tanıtım videosu'),
  ('88888888-8888-8888-8888-888888888888', current_date + 1, '10:30', '12:30', 'Nişantaşı', 'photo', 'Ürün çekimi');

insert into shoot_clients (shoot_id, client_id) values
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222');

insert into shoot_team (shoot_id, team_member_id) values
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

insert into influencers (id, name, nickname, instagram_url, tiktok_url, last_budget) values
  ('77777777-7777-7777-7777-777777777777', 'Deniz Aksoy', 'denizgezer', 'https://instagram.com/denizgezer', null, 15000),
  ('66666666-6666-6666-6666-666666666666', 'Ela Yıldız', 'elastyle', 'https://instagram.com/elastyle', 'https://tiktok.com/@elastyle', 22000);

insert into campaigns (id, client_id, title, campaign_date, status) values
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Lagune Otel Yaz Kampanyası', current_date + 14, 'planning');

insert into campaign_influencers (campaign_id, influencer_id, budget) values
  ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 15000),
  ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 20000);
