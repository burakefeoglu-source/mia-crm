import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, clients(name), team_members(name)")
    .order("task_date", { ascending: false })
    .order("start_time");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Görevler</h1>
          <p className="text-sm text-black/50">Tüm görevler, kişi ve müşteri bazlı.</p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Yeni görev
        </Link>
      </div>

      <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black/40 text-xs border-b border-black/5">
              <th className="px-4 py-3 font-medium">Görev</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Kişi</th>
              <th className="px-4 py-3 font-medium">Tarih / saat</th>
              <th className="px-4 py-3 font-medium">Süre</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task: any) => (
              <tr key={task.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3 text-black/60">{task.clients?.name ?? "—"}</td>
                <td className="px-4 py-3 text-black/60">{task.team_members?.name ?? "—"}</td>
                <td className="px-4 py-3 text-black/60">
                  {task.task_date} · {task.start_time?.slice(0, 5)}
                </td>
                <td className="px-4 py-3 text-black/60">{task.duration_minutes} dk</td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
              </tr>
            ))}
            {!tasks?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/40">
                  Henüz görev yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
