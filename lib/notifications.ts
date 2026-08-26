import { sendWhatsAppTemplate } from "@/lib/whatsapp";

interface TaskInfo {
  id: string;
  title: string;
  client_id: string | null;
  task_date: string;
  start_time: string;
}

// Görev atanan ekip üyelerine WhatsApp bildirimi gönderir.
// supabase: herhangi bir Supabase client (session ya da admin) olabilir.
export async function notifyTaskAssignees(
  supabase: any,
  task: TaskInfo,
  assigneeIds: string[]
) {
  if (!assigneeIds.length) return;

  const [{ data: members }, { data: client }] = await Promise.all([
    supabase.from("team_members").select("id, name, phone").in("id", assigneeIds),
    task.client_id
      ? supabase.from("clients").select("name").eq("id", task.client_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const clientName = client?.name ?? "Müşteri yok";

  for (const member of members ?? []) {
    if (!member.phone) continue;
    const phone = member.phone.replace(/[^0-9]/g, "");
    await sendWhatsAppTemplate(phone, "yeni_gorev_bildirimi", [
      member.name,
      task.title,
      clientName,
      task.task_date,
      task.start_time?.slice(0, 5),
    ]).catch(() => {});
  }
}
