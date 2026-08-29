"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCurrentTeamMember() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabase
    .from("team_members")
    .select("*")
    .ilike("email", user.email)
    .maybeSingle();

  return data;
}

export async function updateOwnProfileAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Giriş yapılmamış");

  const { error } = await supabase
    .from("team_members")
    .update({
      phone: (formData.get("phone") as string) || null,
      avatar_url: (formData.get("avatar_url") as string) || null,
    })
    .ilike("email", user.email);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
