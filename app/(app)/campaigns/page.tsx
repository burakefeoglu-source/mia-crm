import { createClient } from "@/lib/supabase/server";
import { IconPlus, IconFileTypePdf } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  planning: "planlanıyor",
  active: "aktif",
  completed: "tamamlandı",
};

export default async function CampaignsPage() {
  const supabase = createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, clients(name), campaign_influencers(influencer_id, budget, influencers(name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Kampanyalar</h1>
          <p className="text-sm text-black/50">
            Hangi influencer'larla çalışacağını seç, müşteriye PDF olarak gönder.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Yeni kampanya
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {campaigns?.map((c: any) => (
          <div key={c.id} className="bg-white border border-black/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-black/50">
                  {c.clients?.name ?? "Müşteri yok"} · {STATUS_LABELS[c.status]}
                  {c.campaign_date && ` · ${c.campaign_date}`}
                </div>
              </div>
              <a
                href={`/api/campaigns/${c.id}/pdf`}
                className="flex items-center gap-1.5 text-xs border border-black/10 rounded-lg px-3 py-1.5 text-black/60 hover:bg-black/5"
              >
                <IconFileTypePdf size={14} />
                PDF indir
              </a>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.campaign_influencers?.map((ci: any) => (
                <span
                  key={ci.influencer_id}
                  className="text-xs bg-mia-light text-mia px-2 py-1 rounded-md"
                >
                  {ci.influencers?.name}
                </span>
              ))}
            </div>
          </div>
        ))}
        {!campaigns?.length && (
          <div className="text-center text-sm text-black/40 py-8">Henüz kampanya yok.</div>
        )}
      </div>
    </div>
  );
}
