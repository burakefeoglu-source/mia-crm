# Mia Digital Solutions — CRM (MVP)

Hero APPS Yazılım Ltd. Şti. için ajans yönetim uygulaması. Next.js + Supabase.

## Kapsam (MVP)
- Görev takibi (kim, ne zaman, ne kadar sürede, durum: bekliyor/devam ediyor/revize/tamamlandı)
- Çekim takvimi (tarih/saat/lokasyon/ekip, çoklu müşteri desteği)
- Google Drive dosya bağlama (görev/çekim bazlı, Google Picker ile)
- Influencer listesi + kampanya oluşturma + müşteriye PDF çıktı

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local içini doldur (Supabase URL/key, Google API key/client id)
```

Supabase migration'ı çalıştır:

```bash
supabase db push
# veya: psql <connection-string> -f supabase/migrations/0001_init.sql
```

Geliştirme sunucusu:

```bash
npm run dev
```

## Klasör yapısı

```
app/
  (app)/              — Sidebar'lı korumalı sayfalar
    dashboard/         — Panel
    tasks/              — Görev listesi
    calendar/           — Haftalık çekim takvimi
    clients/             — Müşteri listesi
    team/                 — Ekip listesi
    influencers/           — Influencer listesi
    campaigns/              — Kampanya + PDF çıktı
    drive/                   — Bağlı Drive dosyaları
  api/campaigns/[id]/pdf/     — PDF üretim endpoint'i (pdf-lib)
components/
  Sidebar.tsx
  StatusBadge.tsx
  DrivePickerButton.tsx        — Google Picker entegrasyonu (OAuth token akışı tamamlanmalı)
lib/supabase/
  client.ts, server.ts, types.ts
supabase/migrations/
  0001_init.sql                — tüm tablolar + RLS
```

## Yapılacaklar (sıradaki adımlar)
1. Google Cloud Console'da OAuth client + Picker API key oluştur, `DrivePickerButton.tsx` içindeki
   `getGoogleAccessToken` fonksiyonunu Supabase Auth Google provider'ıyla bağla.
2. Görev/çekim/müşteri/influencer için create/edit formlarını (şu an sadece listeleme var) ekle.
3. Auth: Supabase magic link ile 5-6 kişilik ekip girişi.
4. `supabase gen types typescript` ile `lib/supabase/types.ts` içindeki `Database` tipini gerçek şemadan üret.
