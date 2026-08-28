import { createClient } from "@/lib/supabase/server";
import { AssistantClient } from "@/components/AssistantClient";
import { getOverdueTasks, getUnderStaffedShoots, getWorkloadByMember } from "@/lib/pm-insights";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

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
    supabase.from("team_members").select("id, name"),
  ]);

  const overdue = getOverdueTasks(tasks ?? []);
  const understaffed = getUnderStaffedShoots(shoots ?? []);
  const workload = getWorkloadByMember(tasks ?? [], members ?? []);

  return (
    <AssistantClient
      overdueTasks={overdue}
      understaffedShoots={understaffed}
      workload={workload}
    />
  );
}
