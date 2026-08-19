"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconBrandInstagram,
  IconBrandTiktok,
  IconExternalLink,
  IconPencil,
  IconPower,
} from "@tabler/icons-react";
import { Modal } from "@/components/Modal";
import { ClientForm } from "@/components/forms/ClientForm";
import { toggleClientActiveAction } from "@/lib/actions/core";

const SECTOR_LABELS: Record<string, string> = {
  fnb: "F&B",
  hotel: "Otel",
  jewelry: "Mücevher",
  other: "Diğer",
};

export function ClientDetailClient({
  client,
  openTaskCount,
  upcomingShootsCount,
}: {
  client: any;
  openTaskCount: number;
  upcomingShootsCount: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const closeEdit = () => {
    setEditOpen(false);
    router.refresh();
  };

  const toggleActive = async () => {
    setPending(true);
    await toggleClientActiveAction(client.id, !client.is_active);
    setPending(false);
    router.refresh();
  };

  return (
    <div className="max-w-2xl">
      <Link href="/clients" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Müşteriler
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-mia-light text-mia flex items-center justify-center font-display font-medium">
              {client.name[0]}
            </div>
          )}
          <div>
            <h1 className="font-display text-xl font-medium">{client.name}</h1>
            <p className="text-sm text-black/50">
              {SECTOR_LABELS[client.sector]}
              {!client.is_active && <span className="ml-2 text-red-500">· pasif</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-xs border border-black/10 rounded-lg px-3 py-2 text-black/60 hover:bg-black/5"
          >
            <IconPencil size={14} /> Düzenle
          </button>
          <button
            onClick={toggleActive}
            disabled={pending}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 disabled:opacity-50 ${
              client.is_active
                ? "border-black/10 text-black/60 hover:bg-black/5"
                : "border-mia text-mia bg-mia-light"
            }`}
          >
            <IconPower size={14} /> {client.is_active ? "Pasife al" : "Aktif et"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-black/5 rounded-xl p-4">
          <div className="text-xs text-black/50 mb-1">Açık görev</div>
          <div className="text-2xl font-display font-medium">{openTaskCount}</div>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4">
          <div className="text-xs text-black/50 mb-1">Yaklaşan çekim</div>
          <div className="text-2xl font-display font-medium">{upcomingShootsCount}</div>
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

      {editOpen && (
        <Modal title="Müşteriyi düzenle" onClose={closeEdit}>
          <ClientForm onDone={closeEdit} initial={client} />
        </Modal>
      )}
    </div>
  );
}
