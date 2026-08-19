"use client";

import { useState, useRef, useTransition } from "react";
import { createTaskAction, updateTaskAction, deleteTaskAction } from "@/lib/actions/core";
import { IconTrash } from "@tabler/icons-react";

interface Option {
  id: string;
  name: string;
}

const DURATION_OPTIONS = [
  { value: "custom", label: "Özel" },
  { value: "half_day", label: "Yarım gün" },
  { value: "full_day", label: "1 gün" },
  { value: "two_days", label: "2 gün" },
];

interface TaskInitial {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  task_date: string;
  start_time: string;
  duration_minutes: number;
  duration_preset: string;
  status: string;
  assigneeIds: string[];
}

export function TaskForm({
  clients,
  members,
  onDone,
  initial,
  onDelete,
}: {
  clients: Option[];
  members: Option[];
  onDone: () => void;
  initial?: TaskInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [preset, setPreset] = useState(initial?.duration_preset ?? "custom");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateTaskAction(initial.id, formData);
      } else {
        await createTaskAction(formData);
        formRef.current?.reset();
        setPreset("custom");
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm("Bu görevi silmek istediğine emin misin?")) return;
    startTransition(async () => {
      await deleteTaskAction(initial.id);
      onDelete();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Görev başlığı
        <input
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Reels kurgu"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Açıklama
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={2}
          placeholder="Görev detayları…"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Müşteri
        <select
          name="client_id"
          defaultValue={initial?.client_id ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="">Seçilmedi</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="text-sm text-black/60">
        Atanan kişiler (birden fazla seçebilirsin)
        <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-32 overflow-y-auto flex flex-col gap-1">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
              <input
                type="checkbox"
                name="assignee_ids"
                value={m.id}
                defaultChecked={initial?.assigneeIds.includes(m.id)}
              />
              {m.name}
            </label>
          ))}
          {!members.length && <div className="text-xs text-black/30 px-1.5">Ekip yok</div>}
        </div>
      </div>

      <div className="flex gap-3">
        <label className="text-sm text-black/60 flex-1">
          Tarih
          <input
            type="date"
            name="task_date"
            required
            defaultValue={initial?.task_date}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          Saat
          <input
            type="time"
            name="start_time"
            required
            defaultValue={initial?.start_time}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
      </div>

      <div className="text-sm text-black/60">
        Süre
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreset(opt.value)}
              className={`text-xs py-2 rounded-lg border ${
                preset === opt.value
                  ? "bg-mia text-white border-mia"
                  : "border-black/10 text-black/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="duration_preset" value={preset} />
        {preset === "custom" && (
          <input
            type="number"
            name="duration_minutes"
            defaultValue={initial?.duration_minutes ?? 60}
            min={15}
            step={15}
            placeholder="Dakika"
            className="mt-2 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        )}
      </div>

      <label className="text-sm text-black/60">
        Durum
        <select
          name="status"
          defaultValue={initial?.status ?? "todo"}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="todo">Bekliyor</option>
          <option value="in_progress">Devam ediyor</option>
          <option value="revision">Revize</option>
          <option value="done">Tamamlandı</option>
        </select>
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
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Görev ekle"}
        </button>
      </div>
    </form>
  );
}
