import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 8);

  const { data: todayTasks } = await supabase
    .from("tasks")
    .select("*, clients(name), task_assignees(team_members(name))")
    .eq("task_date", today)
    .order("start_time");

  const { data: upcomingShoots } = await supabase
    .from("shoots")
    .select("*")
    .gte("shoot_date", today)
    .order("shoot_date")
    .limit(3);

  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const { data: members } = await supabase.from("team_members").select("id, name").order("name");
  const { data: notes } = await supabase
    .from("notes")
    .select("id, content")
    .order("created_at", { ascending: false })
    .limit(5);

  // Ay için işaretli tarihler (görev veya çekim olan günler)
  const monthStart = today.slice(0, 8) + "01";
  const { data: monthTasks } = await supabase
    .from("tasks")
    .select("task_date")
    .gte("task_date", monthStart);
  const { data: monthShoots } = await supabase
    .from("shoots")
    .select("shoot_date")
    .gte("shoot_date", monthStart);
  const markedDates = Array.from(
    new Set([
      ...(monthTasks?.map((t) => t.task_date) ?? []),
      ...(monthShoots?.map((s) => s.shoot_date) ?? []),
    ])
  );

  // Şu an ne yapıyor: bugün, saat aralığına giren görevi olan kişiler
  const activeNow = (members ?? []).map((m) => {
    const activeTask = (todayTasks ?? []).find((t: any) => {
      const assignees = t.task_assignees?.map((a: any) => a.team_members?.name) ?? [];
      if (!assignees.includes(m.name)) return false;
      const start = t.start_time;
      const [h, min] = start.split(":").map(Number);
      const endMinutes = h * 60 + min + t.duration_minutes;
      const [nh, nmin] = nowTime.split(":").map(Number);
      const nowMinutes = nh * 60 + nmin;
      const startMinutes = h * 60 + min;
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    });
    return {
      id: m.id,
      name: m.name,
      task_title: activeTask?.title ?? null,
      client_name: (activeTask as any)?.clients?.name ?? null,
    };
  });

  return (
    <DashboardClient
      todayTasks={todayTasks ?? []}
      upcomingShoots={upcomingShoots ?? []}
      clients={clients ?? []}
      members={members ?? []}
      activeNow={activeNow}
      notes={notes ?? []}
      markedDates={markedDates}
    />
  );
}
