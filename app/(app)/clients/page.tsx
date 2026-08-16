import { createClient } from "@/lib/supabase/server";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SECTOR_LABELS: Record<string, string> = {
  fnb: "F&B",
  hotel: "Otel",
  jewelry: "Mücevher",
  other: "Diğer",
};

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Müşteriler</h1>
          <p className="text-sm text-black/50">Ajansın hizmet verdiği tüm markalar.</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Yeni müşteri
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {clients?.map((client) => (
          <div key={client.id} className="bg-white border border-black/5 rounded-xl p-4">
            <div className="text-sm font-medium mb-1">{client.name}</div>
            <div className="text-xs text-black/50">{SECTOR_LABELS[client.sector]}</div>
            {!client.is_active && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-black/5 text-black/50">
                pasif
              </span>
            )}
          </div>
        ))}
        {!clients?.length && (
          <div className="col-span-3 text-center text-sm text-black/40 py-8">
            Henüz müşteri eklenmedi.
          </div>
        )}
      </div>
    </div>
  );
}
