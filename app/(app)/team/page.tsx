import { createClient } from "@/lib/supabase/server";
import { TeamClient } from "@/components/TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = createClient();
  const { data: members } = await supabase.from("team_members").select("*").order("name");

  return <TeamClient members={members ?? []} />;
}
