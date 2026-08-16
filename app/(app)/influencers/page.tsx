import { createClient } from "@/lib/supabase/server";
import { IconPlus, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InfluencersPage() {
  const supabase = createClient();
  const { data: influencers } = await supabase
    .from("influencers")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Influencer listesi</h1>
          <p className="text-sm text-black/50">
            Tüm influencer'lar ve son çalışılan bütçeler. Kampanya oluşturmak için birini seç.
          </p>
        </div>
        <Link
          href="/influencers/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Influencer ekle
        </Link>
      </div>

      <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black/40 text-xs border-b border-black/5">
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">Nick</th>
              <th className="px-4 py-3 font-medium">Sosyal medya</th>
              <th className="px-4 py-3 font-medium">Son bütçe</th>
            </tr>
          </thead>
          <tbody>
            {influencers?.map((inf) => (
              <tr key={inf.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium">{inf.name}</td>
                <td className="px-4 py-3 text-black/60">{inf.nickname ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-black/40">
                    {inf.instagram_url && (
                      <a href={inf.instagram_url} target="_blank" rel="noreferrer">
                        <IconBrandInstagram size={16} />
                      </a>
                    )}
                    {inf.tiktok_url && (
                      <a href={inf.tiktok_url} target="_blank" rel="noreferrer">
                        <IconBrandTiktok size={16} />
                      </a>
                    )}
                    {inf.youtube_url && (
                      <a href={inf.youtube_url} target="_blank" rel="noreferrer">
                        <IconBrandYoutube size={16} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-black/60">
                  {inf.last_budget ? `${inf.last_budget.toLocaleString("tr-TR")} ₺` : "—"}
                </td>
              </tr>
            ))}
            {!influencers?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/40">
                  Henüz influencer eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
