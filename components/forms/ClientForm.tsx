"use client";

import { useTransition } from "react";
import { createClientAction } from "@/lib/actions/core";

export function ClientForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createClientAction(formData);
      onDone();
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Marka adı
        <input
          name="name"
          required
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Sektör
        <select
          name="sector"
          defaultValue="other"
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
          placeholder="Nişantaşı, İstanbul"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Drive linki
        <input
          name="drive_url"
          type="url"
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
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Renk kodları (virgülle ayır)
        <input
          name="brand_colors"
          placeholder="#000DFF, #0A0A0A"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Fontlar
        <input
          name="brand_fonts"
          placeholder="Sora, Inter"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Marka rehberi (Drive linki)
        <input
          name="brand_guide_url"
          type="url"
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
            placeholder="@marka"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          TikTok
          <input
            name="tiktok_handle"
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
        {pending ? "Ekleniyor…" : "Müşteri ekle"}
      </button>
    </form>
  );
}
