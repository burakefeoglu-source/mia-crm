import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { IconPlus } from "@tabler/icons-react";
import type { Task } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, clients(name), team_members(name)")
    .eq("task_date", today)
    .order("start_time");

  const { data: shoots } = await supabase
    .from("shoots")
    .select("*")
    .gte("shoot_date", today)
    .order("shoot_date")
    .limit(3);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium mb-1">Bugün ne çekiyoruz?</h1>
      <p className="text-sm text-black/50 mb-6">
        Görevleri ve çekimleri tek yerden takip et.
      </p>

      <button className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg mb-8">
        <IconPlus size={16} />
        Yeni görev ekle
      </button>

      <h2 className="text-sm font-medium mb-3">Bugünün görevleri</h2>
      <div className="bg-white border border-black/5 rounded-xl overflow-hidden mb-8">
        {(tasks as (Task & { clients: { name: string } | null; team_members: { name: string } | null })[] | null)
          ?.length ? (
          tasks!.map((task: any) => (
            <div
              key={task.id}
              className="flex items-center justify-between px-4 py-3 border-b border-black/5 last:border-0"
            >
              <div>
                <div className="text-sm font-medium">
                  {task.title} {task.clients?.name && `— ${task.clients.name}`}
                </div>
                <div className="text-xs text-black/50">
                  {task.team_members?.name ?? "Atanmadı"} · {task.start_time?.slice(0, 5)}
                </div>
              </div>
              <StatusBadge status={task.status} />
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-black/40 text-center">
            Bugün için görev yok.
          </div>
        )}
      </div>

      <h2 className="text-sm font-medium mb-3">Yaklaşan çekimler</h2>
      <div className="flex flex-col gap-2">
        {shoots?.length ? (
          shoots.map((shoot) => (
            <div
              key={shoot.id}
              className="flex items-center gap-3 bg-white border border-black/5 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium capitalize">
                  {shoot.shoot_type === "video" ? "Video" : "Foto"} çekimi
                  {shoot.location && ` — ${shoot.location}`}
                </div>
                <div className="text-xs text-black/50">
                  {shoot.shoot_date} · {shoot.start_time?.slice(0, 5)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-black/40">Planlanmış çekim yok.</div>
        )}
      </div>
    </div>
  );
}
