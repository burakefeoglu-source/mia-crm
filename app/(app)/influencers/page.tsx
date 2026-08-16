import { createClient } from "@/lib/supabase/server";
import { InfluencersClient } from "@/components/InfluencersClient";

export const dynamic = "force-dynamic";

export default async function InfluencersPage() {
  const supabase = createClient();

  const { data: influencers } = await supabase.from("influencers").select("*").order("name");
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, clients(name), campaign_influencers(influencer_id, budget, influencers(name))")
    .order("created_at", { ascending: false });
  const { data: clients } = await supabase.from("clients").select("id, name").order("name");

  return (
    <InfluencersClient
      influencers={influencers ?? []}
      campaigns={campaigns ?? []}
      clients={clients ?? []}
    />
  );
}
