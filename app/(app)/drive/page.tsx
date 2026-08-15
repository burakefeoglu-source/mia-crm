import { createClient } from "@/lib/supabase/server";
import { IconBrandGoogleDrive } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

// Bu sayfa görev/çekimlere bağlanan Drive dosyalarını listeler.
// Yeni dosya bağlama işlemi Google Picker ile ilgili görev/çekim sayfasından yapılır
// (bkz. components/DrivePickerButton.tsx) — burada sadece genel görünüm var.
export default async function DrivePage() {
  const supabase = createClient();
  const { data: files } = await supabase
    .from("linked_files")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium mb-1">Drive</h1>
      <p className="text-sm text-black/50 mb-6">
        Görev ve çekimlere bağlanan tüm Drive dosyaları.
      </p>

      <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
        {files?.map((f) => (
          <a
            key={f.id}
            href={f.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/5"
          >
            <IconBrandGoogleDrive size={16} className="text-mia shrink-0" />
            <span className="text-sm flex-1">{f.file_name}</span>
            <span className="text-xs text-black/40 capitalize">{f.entity_type}</span>
          </a>
        ))}
        {!files?.length && (
          <div className="px-4 py-8 text-center text-sm text-black/40">
            Henüz bağlı dosya yok. Bir görev veya çekim içinden "Dosya bağla" ile ekleyebilirsin.
          </div>
        )}
      </div>
    </div>
  );
}
