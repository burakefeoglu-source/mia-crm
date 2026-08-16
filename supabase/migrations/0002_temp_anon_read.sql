-- GEÇİCİ: auth ekranı gelene kadar anonim (giriş yapmamış) okuma izni.
-- Auth eklendiğinde bu politikalar kaldırılmalı.
create policy "temp_anon_read" on clients for select using (true);
create policy "temp_anon_read" on team_members for select using (true);
create policy "temp_anon_read" on tasks for select using (true);
create policy "temp_anon_read" on shoots for select using (true);
create policy "temp_anon_read" on shoot_clients for select using (true);
create policy "temp_anon_read" on shoot_team for select using (true);
create policy "temp_anon_read" on linked_files for select using (true);
create policy "temp_anon_read" on influencers for select using (true);
create policy "temp_anon_read" on campaigns for select using (true);
create policy "temp_anon_read" on campaign_influencers for select using (true);
