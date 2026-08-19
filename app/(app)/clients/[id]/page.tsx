import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientDetailClient } from "@/components/ClientDetailClient";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", params.id).single();
  if (!client) notFound();

  const today = new Date().toISOString().slice(0, 10);

  const { count: openTaskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("client_id", params.id)
    .neq("status", "done");

  const { data: upcomingShoots } = await supabase
    .from("shoots")
    .select("*, shoot_clients!inner(client_id)")
    .eq("shoot_clients.client_id", params.id)
    .gte("shoot_date", today)
    .order("shoot_date")
    .limit(5);

  return (
    <ClientDetailClient
      client={client}
      openTaskCount={openTaskCount ?? 0}
      upcomingShootsCount={upcomingShoots?.length ?? 0}
    />
  );
}
