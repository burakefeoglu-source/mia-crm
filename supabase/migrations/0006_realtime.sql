-- Görevler tablosunda gerçek zamanlı (realtime) güncellemeleri etkinleştirir.
-- Bu sayede WhatsApp'tan gelen yeni görevler sayfa yenilenmeden anında görünür.
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table shoots;
