"use client";

import { useCallback, useState } from "react";
import { IconBrandGoogleDrive, IconLoader2 } from "@tabler/icons-react";
import { loadGoogleDrivePicker } from "@/lib/google-drive-loader";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface PickedFile {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

interface Props {
  onPicked: (file: PickedFile) => void;
}

// Kullanıcının Drive hesabına bağlanıp bir dosya seçmesini sağlar.
// Scope minimal tutulur: drive.file — sadece bu picker'da seçilen dosyalara erişim.
export function DrivePickerButton({ onPicked }: Props) {
  const [loading, setLoading] = useState(false);

  const openPicker = useCallback(async () => {
    setLoading(true);
    try {
      await loadGoogleDrivePicker();

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response: any) => {
          if (response.error) {
            setLoading(false);
            return;
          }
          const accessToken = response.access_token;

          const picker = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCS)
            .setOAuthToken(accessToken)
            .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
            .setCallback((data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const file = data.docs[0];
                onPicked({
                  id: file.id,
                  name: file.name,
                  url: file.url,
                  mimeType: file.mimeType,
                });
              }
              setLoading(false);
            })
            .build();

          picker.setVisible(true);
        },
      });

      tokenClient.requestAccessToken();
    } catch {
      setLoading(false);
    }
  }, [onPicked]);

  return (
    <button
      type="button"
      onClick={openPicker}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs border border-black/10 rounded-lg px-3 py-1.5 text-black/60 hover:bg-black/5 disabled:opacity-50"
    >
      {loading ? <IconLoader2 size={14} className="animate-spin" /> : <IconBrandGoogleDrive size={14} />}
      Dosya bağla
    </button>
  );
}
