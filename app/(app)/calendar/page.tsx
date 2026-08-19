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
  const { data: members } = await supabase.from("team_members").select("id, name").order("name");

  return <CalendarClient shoots={shoots ?? []} clients={clients ?? []} members={members ?? []} />;
}
