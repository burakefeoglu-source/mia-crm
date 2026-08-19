"use client";

import { useState, useTransition } from "react";
import { createCampaignAction, updateCampaignAction, deleteCampaignAction } from "@/lib/actions/influencers";
import { IconTrash } from "@tabler/icons-react";

interface Option {
  id: string;
  name: string;
}

interface CampaignInitial {
  id: string;
  title: string;
  client_id: string | null;
  campaign_date: string | null;
  status: string;
  selectedInfluencers: { id: string; budget: number | null }[];
}

export function CampaignForm({
  clients,
  influencers,
  onDone,
  initial,
  onDelete,
}: {
  clients: Option[];
  influencers: Option[];
  onDone: () => void;
  initial?: CampaignInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(
    initial?.selectedInfluencers.map((i) => i.id) ?? []
  );

  const getInitialBudget = (id: string) =>
    initial?.selectedInfluencers.find((i) => i.id === id)?.budget ?? undefined;

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateCampaignAction(initial.id, formData);
      } else {
        await createCampaignAction(formData);
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm(`"${initial.title}" kampanyası silinsin mi?`)) return;
    startTransition(async () => {
      await deleteCampaignAction(initial.id);
      onDelete();
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Kampanya adı
        <input
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Lagune Otel Yaz Kampanyası"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Müşteri
        <select
          name="client_id"
          defaultValue={initial?.client_id ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="">Seçilmedi</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-black/60">
        Kampanya tarihi
        <input
          type="date"
          name="campaign_date"
          defaultValue={initial?.campaign_date ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      {initial && (
        <label className="text-sm text-black/60">
          Durum
          <select
            name="status"
            defaultValue={initial.status}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
          >
            <option value="planning">Planlanıyor</option>
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </label>
      )}

      <div className="text-sm text-black/60">
        Influencer'lar (genel listeden)
        <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-1">
          {influencers.map((inf) => (
            <div key={inf.id} className="flex items-center gap-2 px-1.5 py-1">
              <label className="flex items-center gap-2 text-sm flex-1">
                <input
                  type="checkbox"
                  name="influencer_ids"
                  value={inf.id}
                  checked={selected.includes(inf.id)}
                  onChange={() => toggle(inf.id)}
                />
                {inf.name}
              </label>
              {selected.includes(inf.id) && (
                <input
                  type="number"
                  name={`budget_${inf.id}`}
                  placeholder="Bütçe TL"
                  min={0}
                  defaultValue={getInitialBudget(inf.id)}
                  className="w-24 border border-black/10 rounded-md px-2 py-1 text-xs outline-none focus:border-mia"
                />
              )}
            </div>
          ))}
          {!influencers.length && (
            <div className="text-xs text-black/30 px-1.5">Henüz influencer eklenmedi</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        {initial && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="w-11 flex items-center justify-center border border-black/10 text-red-500 rounded-lg disabled:opacity-50"
          >
            <IconTrash size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-mia text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Kampanya oluştur"}
        </button>
      </div>
    </form>
  );
}
