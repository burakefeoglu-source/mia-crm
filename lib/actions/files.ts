"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function linkFileAction(
  entityType: "task" | "shoot",
  entityId: string,
  file: { id: string; name: string; url: string; mimeType?: string }
) {
  const supabase = createClient();
  const { error } = await supabase.from("linked_files").insert({
    entity_type: entityType,
    entity_id: entityId,
    google_file_id: file.id,
    file_name: file.name,
    file_url: file.url,
    mime_type: file.mimeType ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/drive");
}

export async function unlinkFileAction(linkedFileId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("linked_files").delete().eq("id", linkedFileId);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/drive");
}
