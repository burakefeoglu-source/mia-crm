"use client";

import { useRef, useTransition } from "react";
import { createShootAction, updateShootAction, deleteShootAction } from "@/lib/actions/shoots";
import { IconTrash } from "@tabler/icons-react";

interface Option {
  id: string;
  name: string;
}

interface ShootInitial {
  id: string;
  title: string | null;
  shoot_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  shoot_type: string;
  is_outdoor: boolean;
  notes: string | null;
  clientIds: string[];
  teamIds: string[];
}

export function ShootForm({
  clients,
  members,
  onDone,
  initial,
  onDelete,
}: {
  clients: Option[];
  members: Option[];
  onDone: () => void;
  initial?: ShootInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateShootAction(initial.id, formData);
      } else {
        await createShootAction(formData);
        formRef.current?.reset();
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm("Bu çekimi silmek istediğine emin misin?")) return;
    startTransition(async () => {
      await deleteShootAction(initial.id);
      onDelete();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Başlık
        <input
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="Lagune Otel — tanıtım videosu"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <div className="text-sm text-black/60">
        İlgili müşteriler (birden fazla seçebilirsin)
        <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-28 overflow-y-auto flex flex-col gap-1">
          {clients.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
              <input
                type="checkbox"
                name="client_ids"
                value={c.id}
                defaultChecked={initial?.clientIds.includes(c.id)}
              />
              {c.name}
            </label>
          ))}
          {!clients.length && <div className="text-xs text-black/30 px-1.5">Müşteri yok</div>}
        </div>
      </div>

      <label className="text-sm text-black/60">
        Konum
        <input
          name="location"
          defaultValue={initial?.location ?? ""}
          placeholder="Adres yaz (örn. Beşiktaş, İstanbul)"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <div className="flex gap-3">
        <label className="text-sm text-black/60 flex-1">
          Gün
          <input
            type="date"
            name="shoot_date"
            required
            defaultValue={initial?.shoot_date}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          Çekim türü
          <select
            name="shoot_type"
            defaultValue={initial?.shoot_type ?? "video"}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
          >
            <option value="video">Video</option>
            <option value="photo">Foto</option>
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <label className="text-sm text-black/60 flex-1">
          Başlangıç saati
          <input
            type="time"
            name="start_time"
            required
            defaultValue={initial?.start_time}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          Bitiş saati
          <input
            type="time"
            name="end_time"
            required
            defaultValue={initial?.end_time}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
      </div>

      <div className="text-sm text-black/60">
        Ekip (birden fazla seçebilirsin)
        <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-28 overflow-y-auto flex flex-col gap-1">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
              <input
                type="checkbox"
                name="team_ids"
                value={m.id}
                defaultChecked={initial?.teamIds.includes(m.id)}
              />
              {m.name}
            </label>
          ))}
          {!members.length && <div className="text-xs text-black/30 px-1.5">Ekip yok</div>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-black/60">
        <input type="checkbox" name="is_outdoor" defaultChecked={initial?.is_outdoor} />
        Dış mekan çekimi (hava durumu takip edilsin)
      </label>

      <label className="text-sm text-black/60">
        Not
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={2}
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
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Çekim ekle"}
        </button>
      </div>
    </form>
  );
}
