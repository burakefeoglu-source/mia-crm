"use client";

import { TeamMemberForm } from "@/components/forms/TeamMemberForm";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  video: "Video",
  edit: "Kurgu",
  design: "Tasarım",
  social: "Sosyal medya",
  brand_management: "Marka yönetimi",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function TeamClient({ members }: { members: any[] }) {
  const router = useRouter();
  const onCreated = () => router.refresh();

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-medium mb-1">Ekip</h1>
          <p className="text-sm text-black/50">Kim ne üzerinde çalışıyor.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white border border-black/5 rounded-xl p-4 flex items-center gap-3">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-mia-light text-mia font-medium text-sm flex items-center justify-center">
                  {initials(member.name)}
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{member.name}</div>
                <div className="text-xs text-black/50">{ROLE_LABELS[member.role]}</div>
                {member.phone && <div className="text-xs text-black/35">{member.phone}</div>}
              </div>
            </div>
          ))}
          {!members.length && (
            <div className="col-span-3 text-center text-sm text-black/40 py-8">
              Henüz ekip üyesi eklenmedi.
            </div>
          )}
        </div>
      </div>

      <div className="w-[320px] shrink-0 bg-white border border-black/5 rounded-2xl p-5 h-fit shadow-sm">
        <div className="text-sm font-medium text-black/80 mb-4">Ekip üyesi ekle</div>
        <TeamMemberForm onDone={onCreated} />
      </div>
    </div>
  );
}
