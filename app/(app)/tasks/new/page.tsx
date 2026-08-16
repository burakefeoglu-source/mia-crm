import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createTaskAction } from "@/lib/actions/core";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: members }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("team_members").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-md">
      <Link href="/tasks" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Görevler
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Yeni görev</h1>

      <form action={createTaskAction} className="flex flex-col gap-4">
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
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-black/60">
          Atanan kişi
          <select
            name="assigned_to"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
          >
            <option value="">Atanmadı</option>
            {members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

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

        <label className="text-sm text-black/60">
          Süre (dakika)
          <input
            type="number"
            name="duration_minutes"
            defaultValue={60}
            min={15}
            step={15}
            required
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

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
          className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2"
        >
          Görev ekle
        </button>
      </form>
    </div>
  );
}
