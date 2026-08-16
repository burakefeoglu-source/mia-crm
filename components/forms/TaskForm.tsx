"use client";

import { useState, useTransition } from "react";
import { createTaskAction } from "@/lib/actions/core";

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

export function TaskForm({
  clients,
  members,
  onDone,
}: {
  clients: Option[];
  members: Option[];
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [preset, setPreset] = useState("custom");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTaskAction(formData);
      onDone();
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Görev başlığı
        <input
          name="title"
          required
          placeholder="Reels kurgu"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Müşteri
        <select
          name="client_id"
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
              <input type="checkbox" name="assignee_ids" value={m.id} />
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
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          Saat
          <input
            type="time"
            name="start_time"
            required
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
            defaultValue={60}
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
          defaultValue="todo"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="todo">Bekliyor</option>
          <option value="in_progress">Devam ediyor</option>
          <option value="revision">Revize</option>
          <option value="done">Tamamlandı</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2 disabled:opacity-50"
      >
        {pending ? "Ekleniyor…" : "Görev ekle"}
      </button>
    </form>
  );
}
