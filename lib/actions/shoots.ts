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
      place_id: (formData.get("location_place_id") as string) || null,
      latitude: formData.get("location_lat") ? Number(formData.get("location_lat")) : null,
      longitude: formData.get("location_lng") ? Number(formData.get("location_lng")) : null,
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

export async function updateShootAction(shootId: string, formData: FormData) {
  const supabase = createClient();

  const clientIds = formData.getAll("client_ids") as string[];
  const teamIds = formData.getAll("team_ids") as string[];

  const { error } = await supabase
    .from("shoots")
    .update({
      title: (formData.get("title") as string) || null,
      shoot_date: formData.get("shoot_date") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      location: (formData.get("location") as string) || null,
      place_id: (formData.get("location_place_id") as string) || null,
      latitude: formData.get("location_lat") ? Number(formData.get("location_lat")) : null,
      longitude: formData.get("location_lng") ? Number(formData.get("location_lng")) : null,
      shoot_type: formData.get("shoot_type") as string,
      is_outdoor: formData.get("is_outdoor") === "on",
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", shootId);

  if (error) throw new Error(error.message);

  await supabase.from("shoot_clients").delete().eq("shoot_id", shootId);
  await supabase.from("shoot_team").delete().eq("shoot_id", shootId);

  if (clientIds.length) {
    const { error: e1 } = await supabase
      .from("shoot_clients")
      .insert(clientIds.map((client_id) => ({ shoot_id: shootId, client_id })));
    if (e1) throw new Error(e1.message);
  }

  if (teamIds.length) {
    const { error: e2 } = await supabase
      .from("shoot_team")
      .insert(teamIds.map((team_member_id) => ({ shoot_id: shootId, team_member_id })));
    if (e2) throw new Error(e2.message);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteShootAction(shootId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("shoots").delete().eq("id", shootId);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
