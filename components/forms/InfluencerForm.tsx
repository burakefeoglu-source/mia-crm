"use client";

import { useRef, useTransition } from "react";
import { createInfluencerAction, updateInfluencerAction, deleteInfluencerAction } from "@/lib/actions/influencers";
import { IconTrash } from "@tabler/icons-react";

interface InfluencerInitial {
  id: string;
  name: string;
  nickname: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  last_budget: number | null;
}

export function InfluencerForm({
  onDone,
  initial,
  onDelete,
}: {
  onDone: () => void;
  initial?: InfluencerInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateInfluencerAction(initial.id, formData);
      } else {
        await createInfluencerAction(formData);
        formRef.current?.reset();
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm(`${initial.name} listeden çıkarılsın mı?`)) return;
    startTransition(async () => {
      await deleteInfluencerAction(initial.id);
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
        Nick
        <input
          name="nickname"
          defaultValue={initial?.nickname ?? ""}
          placeholder="denizgezer"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Instagram linki
        <input
          name="instagram_url"
          type="url"
          defaultValue={initial?.instagram_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        TikTok linki
        <input
          name="tiktok_url"
          type="url"
          defaultValue={initial?.tiktok_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        YouTube linki
        <input
          name="youtube_url"
          type="url"
          defaultValue={initial?.youtube_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Son çalışılan bütçe (TL)
        <input
          name="last_budget"
          type="number"
          min={0}
          defaultValue={initial?.last_budget ?? ""}
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
