import { createClient } from "@/lib/supabase/server";
import { ClientsClient } from "@/components/ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("name");

  return <ClientsClient clients={clients ?? []} />;
}
