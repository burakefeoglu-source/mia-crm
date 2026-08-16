import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { IconArrowLeft, IconBrandInstagram, IconBrandTiktok, IconExternalLink } from "@tabler/icons-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SECTOR_LABELS: Record<string, string> = {
  fnb: "F&B",
  hotel: "Otel",
  jewelry: "Mücevher",
  other: "Diğer",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", params.id).single();
  if (!client) notFound();

  const today = new Date().toISOString().slice(0, 10);

  const { count: openTaskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("client_id", params.id)
    .neq("status", "done");

  const { data: upcomingShoots } = await supabase
    .from("shoots")
    .select("*, shoot_clients!inner(client_id)")
    .eq("shoot_clients.client_id", params.id)
    .gte("shoot_date", today)
    .order("shoot_date")
    .limit(5);

  return (
    <div className="max-w-2xl">
      <Link href="/clients" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Müşteriler
      </Link>

      <div className="flex items-center gap-3 mb-6">
        {client.logo_url ? (
          <img src={client.logo_url} alt={client.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-mia-light text-mia flex items-center justify-center font-display font-medium">
            {client.name[0]}
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-medium">{client.name}</h1>
          <p className="text-sm text-black/50">{SECTOR_LABELS[client.sector]}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-black/5 rounded-xl p-4">
          <div className="text-xs text-black/50 mb-1">Açık görev</div>
          <div className="text-2xl font-display font-medium">{openTaskCount ?? 0}</div>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4">
          <div className="text-xs text-black/50 mb-1">Yaklaşan çekim</div>
          <div className="text-2xl font-display font-medium">{upcomingShoots?.length ?? 0}</div>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-xl p-5 mb-4">
        <div className="text-sm font-medium mb-3">İletişim & konum</div>
        <div className="flex flex-col gap-2 text-sm text-black/60">
          {client.address && <div>{client.address}</div>}
          {client.drive_url && (
            <a
              href={client.drive_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-mia"
            >
              <IconExternalLink size={14} /> Drive klasörü
            </a>
          )}
          {(client.instagram_handle || client.tiktok_handle) && (
            <div className="flex items-center gap-3 mt-1">
              {client.instagram_handle && (
                <span className="flex items-center gap-1">
                  <IconBrandInstagram size={14} /> {client.instagram_handle}
                </span>
              )}
              {client.tiktok_handle && (
                <span className="flex items-center gap-1">
                  <IconBrandTiktok size={14} /> {client.tiktok_handle}
                </span>
              )}
            </div>
          )}
          {!client.address && !client.drive_url && !client.instagram_handle && (
            <div className="text-black/30">Bilgi girilmedi.</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-xl p-5">
        <div className="text-sm font-medium mb-3">Marka kiti</div>
        {client.brand_colors?.length ? (
          <div className="flex gap-2 mb-3">
            {client.brand_colors.map((c: string) => (
              <div key={c} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg border border-black/10" style={{ backgroundColor: c }} />
                <span className="text-[10px] text-black/40">{c}</span>
              </div>
            ))}
          </div>
        ) : null}
        {client.brand_fonts && (
          <div className="text-sm text-black/60 mb-1">
            <span className="text-black/40">Fontlar:</span> {client.brand_fonts}
          </div>
        )}
        {client.brand_guide_url && (
          <a
            href={client.brand_guide_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-mia text-sm mt-1"
          >
            <IconExternalLink size={14} /> Marka rehberi
          </a>
        )}
        {!client.brand_colors?.length && !client.brand_fonts && !client.brand_guide_url && (
          <div className="text-sm text-black/30">Marka kiti bilgisi girilmedi.</div>
        )}
      </div>
    </div>
  );
}
