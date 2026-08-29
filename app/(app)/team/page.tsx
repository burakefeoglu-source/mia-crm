import { createClient } from "@/lib/supabase/server";
import { TeamClient } from "@/components/TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = createClient();
  const [{ data: members }, { data: leaves }] = await Promise.all([
    supabase.from("team_members").select("*").order("name"),
    supabase.from("team_leaves").select("*").order("start_date"),
  ]);

  const leavesByMember = (leaves ?? []).reduce<Record<string, any[]>>((acc, l) => {
    (acc[l.team_member_id] ??= []).push(l);
    return acc;
  }, {});

  return <TeamClient members={members ?? []} leavesByMember={leavesByMember} />;
}
