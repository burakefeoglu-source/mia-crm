"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyTaskAssignees, createInAppNotifications } from "@/lib/notifications";

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
    place_id: (formData.get("address_place_id") as string) || null,
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
    place_id: (formData.get("address_place_id") as string) || null,
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
  const repeatMonths = Math.max(0, Math.min(11, Number(formData.get("repeat_months")) || 0));
  const repeatGroupId = repeatMonths > 0 ? crypto.randomUUID() : null;

  const baseDate = formData.get("task_date") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const startTime = formData.get("start_time") as string;
  const status = (formData.get("status") as string) || "todo";

  const occurrenceDates = [baseDate];
  for (let i = 1; i <= repeatMonths; i++) {
    const d = new Date(baseDate + "T00:00:00");
    d.setMonth(d.getMonth() + i);
    occurrenceDates.push(d.toISOString().slice(0, 10));
  }

  const { data: insertedTasks, error } = await supabase
    .from("tasks")
    .insert(
      occurrenceDates.map((task_date) => ({
        title,
        description,
        client_id: clientId || null,
        task_date,
        start_time: startTime,
        duration_minutes: durationMinutes,
        duration_preset: durationPreset,
        status,
        repeat_group_id: repeatGroupId,
      }))
    )
    .select();

  if (error) throw new Error(error.message);
  const task = insertedTasks![0];

  if (assigneeIds.length) {
    const { error: e1 } = await supabase.from("task_assignees").insert(
      insertedTasks!.flatMap((t) => assigneeIds.map((team_member_id) => ({ task_id: t.id, team_member_id })))
    );
    if (e1) throw new Error(e1.message);

    // Bildirimler sadece ilk (yakın) görev için gönderilir, gelecek aylar için spam yapılmaz.
    await notifyTaskAssignees(supabase, task, assigneeIds);
    await createInAppNotifications(supabase, assigneeIds, {
      type: "task_assigned",
      title: repeatMonths > 0 ? "Yeni tekrarlayan görev atandı" : "Yeni görev atandı",
      body: task.title,
      link: "/tasks",
    });
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

export async function addTeamLeaveAction(memberId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("team_leaves").insert({
    team_member_id: memberId,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    note: (formData.get("note") as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

export async function removeTeamLeaveAction(leaveId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("team_leaves").delete().eq("id", leaveId);
  if (error) throw new Error(error.message);
  revalidatePath("/team");
}

export async function updateNotificationPrefAction(enabled: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Giriş yapılmamış");

  const { error } = await supabase
    .from("team_members")
    .update({ whatsapp_notifications_enabled: enabled })
    .ilike("email", user.email);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
