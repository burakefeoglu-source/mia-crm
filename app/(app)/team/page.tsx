import { createClient } from "@/lib/supabase/server";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  video: "Video",
  edit: "Kurgu",
  design: "Tasarım",
  social: "Sosyal medya",
  brand_management: "Marka yönetimi",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function TeamPage() {
  const supabase = createClient();
  const { data: members } = await supabase.from("team_members").select("*").order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Ekip</h1>
          <p className="text-sm text-black/50">Kim ne üzerinde çalışıyor.</p>
        </div>
        <Link
          href="/team/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Ekip üyesi ekle
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {members?.map((member) => (
          <div key={member.id} className="bg-white border border-black/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mia-light text-mia font-medium text-sm flex items-center justify-center">
              {initials(member.name)}
            </div>
            <div>
              <div className="text-sm font-medium">{member.name}</div>
              <div className="text-xs text-black/50">{ROLE_LABELS[member.role]}</div>
            </div>
          </div>
        ))}
        {!members?.length && (
          <div className="col-span-3 text-center text-sm text-black/40 py-8">
            Henüz ekip üyesi eklenmedi.
          </div>
        )}
      </div>
    </div>
  );
}
