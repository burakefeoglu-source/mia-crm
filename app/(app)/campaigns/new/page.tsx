"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { createCampaignAction } from "@/lib/actions/influencers";

interface Option {
  id: string;
  name: string;
}

export default function NewCampaignPage() {
  const [clients, setClients] = useState<Option[]>([]);
  const [influencers, setInfluencers] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clients")
      .select("id, name")
      .order("name")
      .then(({ data }) => setClients(data ?? []));
    supabase
      .from("influencers")
      .select("id, name")
      .order("name")
      .then(({ data }) => setInfluencers(data ?? []));
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="max-w-md">
      <Link href="/campaigns" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Kampanyalar
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Yeni kampanya</h1>

      <form action={createCampaignAction} className="flex flex-col gap-4">
        <label className="text-sm text-black/60">
          Kampanya adı
          <input
            name="title"
            required
            placeholder="Lagune Otel Yaz Kampanyası"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Müşteri
          <select
            name="client_id"
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
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <div className="text-sm text-black/60">
          Influencer'lar
          <div className="mt-1.5 border border-black/10 rounded-lg p-2 flex flex-col gap-1">
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

        <button
          type="submit"
          className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2"
        >
          Kampanya oluştur
        </button>
      </form>
    </div>
  );
}
