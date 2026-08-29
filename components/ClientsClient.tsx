"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ClientForm } from "@/components/forms/ClientForm";
import { useRouter } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

const SECTOR_LABELS: Record<string, string> = {
  fnb: "F&B",
  hotel: "Otel",
  jewelry: "Mücevher",
  other: "Diğer",
};

export function ClientsClient({ clients }: { clients: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const onCreated = () => router.refresh();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-medium mb-1">Müşteriler</h1>
          <p className="text-sm text-black/50">Ajansın hizmet verdiği tüm markalar.</p>
        </div>

        <div className="relative mb-4">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Müşteri ara…"
            className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white border border-black/5 rounded-xl p-4 hover:border-black/10 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                {client.brand_colors?.[0] && (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: client.brand_colors[0] }}
                  />
                )}
                <div className="text-sm font-medium">{client.name}</div>
              </div>
              <div className="text-xs text-black/50">{SECTOR_LABELS[client.sector]}</div>
              {!client.is_active && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-black/5 text-black/50">
                  pasif
                </span>
              )}
            </Link>
          ))}
          {!filtered.length && (
            <div className="col-span-3 text-center text-sm text-black/40 py-8">
              {clients.length ? "Aramayla eşleşen müşteri yok." : "Henüz müşteri eklenmedi."}
            </div>
          )}
        </div>
      </div>

      <div className="w-[320px] shrink-0 bg-white border border-black/5 rounded-2xl p-5 h-fit shadow-sm">
        <div className="text-sm font-medium text-black/80 mb-4">Yeni müşteri</div>
        <ClientForm onDone={onCreated} />
      </div>
    </div>
  );
}
