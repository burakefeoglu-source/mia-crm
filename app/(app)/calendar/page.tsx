import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "@/components/CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = createClient();

  const { data: shoots } = await supabase
    .from("shoots")
    .select(
      "*, shoot_clients(client_id, clients(id, name)), shoot_team(team_member_id, team_members(id, name))"
    )
    .order("shoot_date");

  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const { data: membersRaw } = await supabase.from("team_members").select("id, name").order("name");
  const { data: leaves } = await supabase.from("team_leaves").select("team_member_id, start_date, end_date");
  const { data: linkedFiles } = await supabase
    .from("linked_files")
    .select("id, entity_id, file_name, file_url")
    .eq("entity_type", "shoot");

  const leavesByMember = (leaves ?? []).reduce<Record<string, { start_date: string; end_date: string }[]>>(
    (acc, l) => {
      (acc[l.team_member_id] ??= []).push({ start_date: l.start_date, end_date: l.end_date });
      return acc;
    },
    {}
  );

  const members = (membersRaw ?? []).map((m) => ({ ...m, leaves: leavesByMember[m.id] ?? [] }));

  const filesByShoot = (linkedFiles ?? []).reduce<Record<string, any[]>>((acc, f) => {
    (acc[f.entity_id] ??= []).push(f);
    return acc;
  }, {});

  return (
    <CalendarClient
      shoots={shoots ?? []}
      clients={clients ?? []}
      members={members}
      filesByShoot={filesByShoot}
    />
  );
}
