"use client";

import { useCallback } from "react";
import { IconBrandGoogleDrive } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface Props {
  entityType: "task" | "shoot";
  entityId: string;
  onLinked?: () => void;
}

// Google Picker açar, seçilen dosyayı linked_files tablosuna yazar.
// Scope minimal tutulur: drive.file (sadece kullanıcının bu picker'da seçtiği dosyalara erişim).
// Gerekli env: NEXT_PUBLIC_GOOGLE_API_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID
export function DrivePickerButton({ entityType, entityId, onLinked }: Props) {
  const openPicker = useCallback(async () => {
    // gapi + google.picker script'lerinin layout.tsx veya bu bileşen içinde
    // <Script src="https://apis.google.com/js/api.js"> ile önceden yüklenmiş olması gerekir.
    const accessToken = await getGoogleAccessToken(); // OAuth akışından alınır

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
      .setCallback(async (data: any) => {
        if (data.action !== window.google.picker.Action.PICKED) return;
        const file = data.docs[0];

        const supabase = createClient();
        await supabase.from("linked_files").insert({
          entity_type: entityType,
          entity_id: entityId,
          google_file_id: file.id,
          file_name: file.name,
          file_url: file.url,
          mime_type: file.mimeType,
        });

        onLinked?.();
      })
      .build();

    picker.setVisible(true);
  }, [entityType, entityId, onLinked]);

  return (
    <button
      onClick={openPicker}
      className="flex items-center gap-1.5 text-xs border border-black/10 rounded-lg px-3 py-1.5 text-black/60 hover:bg-black/5"
    >
      <IconBrandGoogleDrive size={14} />
      Dosya bağla
    </button>
  );
}

async function getGoogleAccessToken(): Promise<string> {
  // TODO: Supabase Auth Google provider'ından ya da ayrı bir OAuth akışından
  // provider_token alınır. Supabase kullanılıyorsa:
  // const { data: { session } } = await supabase.auth.getSession();
  // return session?.provider_token!;
  throw new Error("getGoogleAccessToken henüz uygulanmadı");
}
