import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createShootAction } from "@/lib/actions/shoots";

export const dynamic = "force-dynamic";

export default async function NewShootPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: members }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("team_members").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-md">
      <Link href="/calendar" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Çekim takvimi
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Yeni çekim</h1>

      <form action={createShootAction} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <label className="text-sm text-black/60 flex-1">
            Tarih
            <input
              type="date"
              name="shoot_date"
              required
              className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
            />
          </label>
          <label className="text-sm text-black/60 flex-1">
            Çekim türü
            <select
              name="shoot_type"
              defaultValue="video"
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
              className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
            />
          </label>
          <label className="text-sm text-black/60 flex-1">
            Bitiş saati
            <input
              type="time"
              name="end_time"
              required
              className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
            />
          </label>
        </div>

        <label className="text-sm text-black/60">
          Lokasyon
          <input
            name="location"
            placeholder="Beşiktaş"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <div className="text-sm text-black/60">
          Müşteriler (birden fazla seçebilirsin)
          <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-32 overflow-y-auto flex flex-col gap-1">
            {clients?.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
                <input type="checkbox" name="client_ids" value={c.id} />
                {c.name}
              </label>
            ))}
            {!clients?.length && <div className="text-xs text-black/30 px-1.5">Müşteri yok</div>}
          </div>
        </div>

        <div className="text-sm text-black/60">
          Ekip (birden fazla seçebilirsin)
          <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-32 overflow-y-auto flex flex-col gap-1">
            {members?.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
                <input type="checkbox" name="team_ids" value={m.id} />
                {m.name}
              </label>
            ))}
            {!members?.length && <div className="text-xs text-black/30 px-1.5">Ekip yok</div>}
          </div>
        </div>

        <label className="text-sm text-black/60">
          Not
          <textarea
            name="notes"
            rows={2}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <button
          type="submit"
          className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2"
        >
          Çekim ekle
        </button>
      </form>
    </div>
  );
}
