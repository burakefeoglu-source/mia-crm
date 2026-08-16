"use client";

import { useTransition } from "react";
import { createTeamMemberAction } from "@/lib/actions/core";

export function TeamMemberForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTeamMemberAction(formData);
      onDone();
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        İsim
        <input
          name="name"
          required
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Rol
        <select
          name="role"
          defaultValue="video"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="video">Video</option>
          <option value="edit">Kurgu</option>
          <option value="design">Tasarım</option>
          <option value="social">Sosyal medya</option>
          <option value="brand_management">Marka yönetimi</option>
        </select>
      </label>

      <label className="text-sm text-black/60">
        E-posta
        <input
          name="email"
          type="email"
          required
          placeholder="ad@miadigital.com"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Telefon (WhatsApp)
        <input
          name="phone"
          type="tel"
          placeholder="+90 5xx xxx xx xx"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Profil fotoğrafı (link)
        <input
          name="avatar_url"
          type="url"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2 disabled:opacity-50"
      >
        {pending ? "Ekleniyor…" : "Ekle"}
      </button>
    </form>
  );
}
