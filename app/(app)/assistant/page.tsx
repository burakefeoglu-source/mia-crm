import { createClient } from "@/lib/supabase/server";
import { AssistantClient } from "@/components/AssistantClient";
import { getOverdueTasks, getUnderStaffedShoots, getWorkloadByMember } from "@/lib/pm-insights";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: tasks }, { data: shoots }, { data: members }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, clients(name), task_assignees(team_members(id, name))")
      .gte("task_date", today.slice(0, 8) + "01")
      .order("task_date"),
    supabase
      .from("shoots")
      .select("*, shoot_team(team_member_id)")
      .gte("shoot_date", today),
    supabase.from("team_members").select("id, name, email"),
  ]);

  // Giriş yapan kişiyi e-posta üzerinden ekip üyesiyle eşleştir.
  const currentMember = (members ?? []).find(
    (m) => m.email?.toLowerCase() === user?.email?.toLowerCase()
  ) ?? null;

  const overdue = getOverdueTasks(tasks ?? []);
  const understaffed = getUnderStaffedShoots(shoots ?? []);
  const workload = getWorkloadByMember(tasks ?? [], members ?? []);

  const myTasksToday = (tasks ?? []).filter((t: any) => {
    if (t.status === "done" || t.task_date !== today) return false;
    if (!currentMember) return false;
    return t.task_assignees?.some((a: any) => a.team_members?.id === currentMember.id);
  });

  return (
    <AssistantClient
      currentMember={currentMember}
      myTasksToday={myTasksToday}
      overdueTasks={overdue}
      understaffedShoots={understaffed}
      workload={workload}
    />
  );
}
