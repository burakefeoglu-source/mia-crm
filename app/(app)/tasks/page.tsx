import { createClient } from "@/lib/supabase/server";
import { TasksClient } from "@/components/TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, clients(name), task_assignees(team_members(id, name))")
    .order("task_date", { ascending: false })
    .order("start_time");

  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const { data: membersRaw } = await supabase.from("team_members").select("id, name").order("name");
  const { data: leaves } = await supabase.from("team_leaves").select("team_member_id, start_date, end_date");
  const { data: linkedFiles } = await supabase
    .from("linked_files")
    .select("id, entity_id, file_name, file_url")
    .eq("entity_type", "task");

  const leavesByMember = (leaves ?? []).reduce<Record<string, { start_date: string; end_date: string }[]>>(
    (acc, l) => {
      (acc[l.team_member_id] ??= []).push({ start_date: l.start_date, end_date: l.end_date });
      return acc;
    },
    {}
  );

  const members = (membersRaw ?? []).map((m) => ({ ...m, leaves: leavesByMember[m.id] ?? [] }));

  const filesByTask = (linkedFiles ?? []).reduce<Record<string, any[]>>((acc, f) => {
    (acc[f.entity_id] ??= []).push(f);
    return acc;
  }, {});

  return (
    <TasksClient
      tasks={tasks ?? []}
      clients={clients ?? []}
      members={members}
      filesByTask={filesByTask}
    />
  );
}
