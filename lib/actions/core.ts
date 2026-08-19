"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const supabase = createClient();

  const colorsRaw = formData.get("brand_colors") as string;
  const brandColors = colorsRaw
    ? colorsRaw.split(",").map((c) => c.trim()).filter(Boolean)
    : null;

  const { error } = await supabase.from("clients").insert({
    name: formData.get("name") as string,
    sector: formData.get("sector") as string,
    is_active: true,
    drive_url: (formData.get("drive_url") as string) || null,
    address: (formData.get("address") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
    brand_colors: brandColors,
    brand_fonts: (formData.get("brand_fonts") as string) || null,
    brand_guide_url: (formData.get("brand_guide_url") as string) || null,
    instagram_handle: (formData.get("instagram_handle") as string) || null,
    tiktok_handle: (formData.get("tiktok_handle") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const supabase = createClient();

  const colorsRaw = formData.get("brand_colors") as string;
  const brandColors = colorsRaw
    ? colorsRaw.split(",").map((c) => c.trim()).filter(Boolean)
    : null;

  const { error } = await supabase
    .from("clients")
    .update({
      name: formData.get("name") as string,
      sector: formData.get("sector") as string,
      drive_url: (formData.get("drive_url") as string) || null,
      address: (formData.get("address") as string) || null,
      logo_url: (formData.get("logo_url") as string) || null,
      brand_colors: brandColors,
      brand_fonts: (formData.get("brand_fonts") as string) || null,
      brand_guide_url: (formData.get("brand_guide_url") as string) || null,
      instagram_handle: (formData.get("instagram_handle") as string) || null,
      tiktok_handle: (formData.get("tiktok_handle") as string) || null,
    })
    .eq("id", clientId);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function toggleClientActiveAction(clientId: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("clients").update({ is_active: isActive }).eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function createTeamMemberAction(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("team_members").insert({
    name: formData.get("name") as string,
    role: formData.get("role") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

export async function updateTeamMemberAction(memberId: string, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("team_members")
    .update({
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      avatar_url: (formData.get("avatar_url") as string) || null,
    })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

export async function deleteTeamMemberAction(memberId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

const DURATION_PRESET_MINUTES: Record<string, number> = {
  half_day: 240,
  full_day: 480,
  two_days: 960,
};

export async function createTaskAction(formData: FormData) {
  const supabase = createClient();

  const clientId = formData.get("client_id") as string;
  const assigneeIds = formData.getAll("assignee_ids") as string[];
  const durationPreset = (formData.get("duration_preset") as string) || "custom";
  const customMinutes = Number(formData.get("duration_minutes")) || 60;
  const durationMinutes = DURATION_PRESET_MINUTES[durationPreset] ?? customMinutes;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      client_id: clientId || null,
      task_date: formData.get("task_date") as string,
      start_time: formData.get("start_time") as string,
      duration_minutes: durationMinutes,
      duration_preset: durationPreset,
      status: (formData.get("status") as string) || "todo",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (assigneeIds.length) {
    const { error: e1 } = await supabase
      .from("task_assignees")
      .insert(assigneeIds.map((team_member_id) => ({ task_id: task.id, team_member_id })));
    if (e1) throw new Error(e1.message);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskAction(taskId: string, formData: FormData) {
  const supabase = createClient();

  const clientId = formData.get("client_id") as string;
  const assigneeIds = formData.getAll("assignee_ids") as string[];
  const durationPreset = (formData.get("duration_preset") as string) || "custom";
  const customMinutes = Number(formData.get("duration_minutes")) || 60;
  const durationMinutes = DURATION_PRESET_MINUTES[durationPreset] ?? customMinutes;

  const { error } = await supabase
    .from("tasks")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      client_id: clientId || null,
      task_date: formData.get("task_date") as string,
      start_time: formData.get("start_time") as string,
      duration_minutes: durationMinutes,
      duration_preset: durationPreset,
      status: (formData.get("status") as string) || "todo",
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  const { error: delErr } = await supabase.from("task_assignees").delete().eq("task_id", taskId);
  if (delErr) throw new Error(delErr.message);

  if (assigneeIds.length) {
    const { error: e1 } = await supabase
      .from("task_assignees")
      .insert(assigneeIds.map((team_member_id) => ({ task_id: taskId, team_member_id })));
    if (e1) throw new Error(e1.message);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(taskId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createNoteAction(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("notes").insert({
    content: formData.get("content") as string,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
