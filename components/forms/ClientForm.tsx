"use client";

import { useRef, useTransition } from "react";
import { createClientAction, updateClientAction } from "@/lib/actions/core";

interface ClientInitial {
  id: string;
  name: string;
  sector: string;
  drive_url: string | null;
  address: string | null;
  logo_url: string | null;
  brand_colors: string[] | null;
  brand_fonts: string | null;
  brand_guide_url: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
}

export function ClientForm({
  onDone,
  initial,
}: {
  onDone: () => void;
  initial?: ClientInitial;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateClientAction(initial.id, formData);
      } else {
        await createClientAction(formData);
        formRef.current?.reset();
      }
      onDone();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Marka adı
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Sektör
        <select
          name="sector"
          defaultValue={initial?.sector ?? "other"}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="fnb">F&B</option>
          <option value="hotel">Otel</option>
          <option value="jewelry">Mücevher</option>
          <option value="other">Diğer</option>
        </select>
      </label>

      <label className="text-sm text-black/60">
        Konum / adres
        <input
          name="address"
          defaultValue={initial?.address ?? ""}
          placeholder="Nişantaşı, İstanbul"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Drive linki
        <input
          name="drive_url"
          type="url"
          defaultValue={initial?.drive_url ?? ""}
          placeholder="https://drive.google.com/…"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <div className="h-px bg-black/5" />
      <div className="text-xs font-medium text-black/40">Marka kiti</div>

      <label className="text-sm text-black/60">
        Logo linki
        <input
          name="logo_url"
          type="url"
          defaultValue={initial?.logo_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Renk kodları (virgülle ayır)
        <input
          name="brand_colors"
          defaultValue={initial?.brand_colors?.join(", ") ?? ""}
          placeholder="#000DFF, #0A0A0A"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Fontlar
        <input
          name="brand_fonts"
          defaultValue={initial?.brand_fonts ?? ""}
          placeholder="Sora, Inter"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Marka rehberi (Drive linki)
        <input
          name="brand_guide_url"
          type="url"
          defaultValue={initial?.brand_guide_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <div className="h-px bg-black/5" />
      <div className="text-xs font-medium text-black/40">Sosyal medya</div>

      <div className="flex gap-3">
        <label className="text-sm text-black/60 flex-1">
          Instagram
          <input
            name="instagram_handle"
            defaultValue={initial?.instagram_handle ?? ""}
            placeholder="@marka"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          TikTok
          <input
            name="tiktok_handle"
            defaultValue={initial?.tiktok_handle ?? ""}
            placeholder="@marka"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Müşteri ekle"}
      </button>
    </form>
  );
}
