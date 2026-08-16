-- Auth eklendi, artık geçici anonim okuma iznine gerek yok. Kaldırıyoruz.
drop policy if exists "temp_anon_read" on clients;
drop policy if exists "temp_anon_read" on team_members;
drop policy if exists "temp_anon_read" on tasks;
drop policy if exists "temp_anon_read" on shoots;
drop policy if exists "temp_anon_read" on shoot_clients;
drop policy if exists "temp_anon_read" on shoot_team;
drop policy if exists "temp_anon_read" on linked_files;
drop policy if exists "temp_anon_read" on influencers;
drop policy if exists "temp_anon_read" on campaigns;
drop policy if exists "temp_anon_read" on campaign_influencers;
