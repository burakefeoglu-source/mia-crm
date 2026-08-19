"use client";

import { useRef, useTransition } from "react";
import { createTeamMemberAction, updateTeamMemberAction, deleteTeamMemberAction } from "@/lib/actions/core";
import { IconTrash } from "@tabler/icons-react";

interface TeamMemberInitial {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

export function TeamMemberForm({
  onDone,
  initial,
  onDelete,
}: {
  onDone: () => void;
  initial?: TeamMemberInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateTeamMemberAction(initial.id, formData);
      } else {
        await createTeamMemberAction(formData);
        formRef.current?.reset();
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm(`${initial.name} ekipten çıkarılsın mı?`)) return;
    startTransition(async () => {
      await deleteTeamMemberAction(initial.id);
      onDelete();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        İsim
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Rol
        <select
          name="role"
          defaultValue={initial?.role ?? "video"}
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
          defaultValue={initial?.email}
          placeholder="ad@miadigital.com"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Telefon (WhatsApp)
        <input
          name="phone"
          type="tel"
          defaultValue={initial?.phone ?? ""}
          placeholder="+90 5xx xxx xx xx"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Profil fotoğrafı (link)
        <input
          name="avatar_url"
          type="url"
          defaultValue={initial?.avatar_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

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
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Ekle"}
        </button>
      </div>
    </form>
  );
}
