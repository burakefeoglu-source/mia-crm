"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClientAction(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("clients").insert({
    name: formData.get("name") as string,
    sector: formData.get("sector") as string,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  redirect("/clients");
}

export async function createTeamMemberAction(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("team_members").insert({
    name: formData.get("name") as string,
    role: formData.get("role") as string,
    email: formData.get("email") as string,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/team");
  redirect("/team");
}

export async function createTaskAction(formData: FormData) {
  const supabase = createClient();

  const clientId = formData.get("client_id") as string;
  const assignedTo = formData.get("assigned_to") as string;

  const { error } = await supabase.from("tasks").insert({
    title: formData.get("title") as string,
    client_id: clientId || null,
    assigned_to: assignedTo || null,
    task_date: formData.get("task_date") as string,
    start_time: formData.get("start_time") as string,
    duration_minutes: Number(formData.get("duration_minutes")),
    status: (formData.get("status") as string) || "todo",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
