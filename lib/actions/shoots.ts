"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShootAction(formData: FormData) {
  const supabase = createClient();

  const clientIds = formData.getAll("client_ids") as string[];
  const teamIds = formData.getAll("team_ids") as string[];

  const { data: shoot, error } = await supabase
    .from("shoots")
    .insert({
      title: (formData.get("title") as string) || null,
      shoot_date: formData.get("shoot_date") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      location: (formData.get("location") as string) || null,
      shoot_type: formData.get("shoot_type") as string,
      is_outdoor: formData.get("is_outdoor") === "on",
      notes: (formData.get("notes") as string) || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (clientIds.length) {
    const { error: e1 } = await supabase
      .from("shoot_clients")
      .insert(clientIds.map((client_id) => ({ shoot_id: shoot.id, client_id })));
    if (e1) throw new Error(e1.message);
  }

  if (teamIds.length) {
    const { error: e2 } = await supabase
      .from("shoot_team")
      .insert(teamIds.map((team_member_id) => ({ shoot_id: shoot.id, team_member_id })));
    if (e2) throw new Error(e2.message);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
