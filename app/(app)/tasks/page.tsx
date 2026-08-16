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
  const { data: members } = await supabase.from("team_members").select("id, name").order("name");

  return <TasksClient tasks={tasks ?? []} clients={clients ?? []} members={members ?? []} />;
}
