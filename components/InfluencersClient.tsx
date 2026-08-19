"use client";

import { useState } from "react";
import {
  IconPlus,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconFileTypePdf,
  IconPencil,
} from "@tabler/icons-react";
import { Modal } from "@/components/Modal";
import { InfluencerForm } from "@/components/forms/InfluencerForm";
import { CampaignForm } from "@/components/forms/CampaignForm";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  planning: "planlanıyor",
  active: "aktif",
  completed: "tamamlandı",
};

export function InfluencersClient({
  influencers,
  campaigns,
  clients,
}: {
  influencers: any[];
  campaigns: any[];
  clients: { id: string; name: string }[];
}) {
  const [infModalOpen, setInfModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<any | null>(null);
  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const router = useRouter();

  const refresh = () => router.refresh();

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-medium mb-1">Influencer listesi</h1>
            <p className="text-sm text-black/50">Tüm influencer'lar ve son çalışılan bütçeler.</p>
          </div>
          <button
            onClick={() => setInfModalOpen(true)}
            className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <IconPlus size={16} />
            Influencer ekle
          </button>
        </div>

        <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-black/40 text-xs border-b border-black/5">
                <th className="px-4 py-3 font-medium">İsim</th>
                <th className="px-4 py-3 font-medium">Nick</th>
                <th className="px-4 py-3 font-medium">Sosyal medya</th>
                <th className="px-4 py-3 font-medium">Son bütçe</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((inf) => (
                <tr key={inf.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.015]">
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
                    {inf.last_budget ? `${Number(inf.last_budget).toLocaleString("tr-TR")} ₺` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingInfluencer(inf)}
                      className="text-black/30 hover:text-mia"
                    >
                      <IconPencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {!influencers.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-black/40">
                    Henüz influencer eklenmedi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-[260px] shrink-0 bg-white border border-black/5 rounded-xl p-4 h-fit">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Kampanyalar</span>
          <button onClick={() => setCampaignFormOpen(true)} className="text-mia">
            <IconPlus size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {campaigns.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setEditingCampaign(c)}
              className="text-left bg-black/[0.03] rounded-lg p-2.5 hover:bg-black/[0.06] transition-colors"
            >
              <div className="text-xs font-medium">{c.title}</div>
              <div className="text-[10px] text-black/45">
                {c.clients?.name ?? "Müşteri yok"} · {STATUS_LABELS[c.status]}
              </div>
            </button>
          ))}
          {!campaigns.length && (
            <div className="text-xs text-black/30 text-center py-4">Henüz kampanya yok.</div>
          )}
        </div>
      </div>

      {infModalOpen && (
        <Modal title="Influencer ekle" onClose={() => { setInfModalOpen(false); refresh(); }}>
          <InfluencerForm onDone={() => { setInfModalOpen(false); refresh(); }} />
        </Modal>
      )}

      {editingInfluencer && (
        <Modal title="Influencer'ı düzenle" onClose={() => { setEditingInfluencer(null); refresh(); }}>
          <InfluencerForm
            onDone={() => { setEditingInfluencer(null); refresh(); }}
            onDelete={() => { setEditingInfluencer(null); refresh(); }}
            initial={editingInfluencer}
          />
        </Modal>
      )}

      {campaignFormOpen && (
        <Modal title="Yeni kampanya" onClose={() => { setCampaignFormOpen(false); refresh(); }}>
          <CampaignForm
            clients={clients}
            influencers={influencers}
            onDone={() => { setCampaignFormOpen(false); refresh(); }}
          />
        </Modal>
      )}

      {editingCampaign && (
        <Modal title={editingCampaign.title} onClose={() => { setEditingCampaign(null); refresh(); }}>
          <div className="flex flex-col gap-4">
            <CampaignForm
              clients={clients}
              influencers={influencers}
              onDone={() => { setEditingCampaign(null); refresh(); }}
              onDelete={() => { setEditingCampaign(null); refresh(); }}
              initial={{
                id: editingCampaign.id,
                title: editingCampaign.title,
                client_id: editingCampaign.client_id,
                campaign_date: editingCampaign.campaign_date,
                status: editingCampaign.status,
                selectedInfluencers: editingCampaign.campaign_influencers?.map((ci: any) => ({
                  id: ci.influencer_id,
                  budget: ci.budget,
                })) ?? [],
              }}
            />
            <a
              href={`/api/campaigns/${editingCampaign.id}/pdf`}
              className="flex items-center justify-center gap-1.5 text-sm border border-black/10 rounded-lg px-4 py-2.5 text-black/70 hover:bg-black/5"
            >
              <IconFileTypePdf size={16} />
              PDF indir — müşteriye gönder
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}
