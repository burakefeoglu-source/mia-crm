"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconChecklist,
  IconCalendarEvent,
  IconBuildingStore,
  IconUsers,
  IconBrandGoogleDrive,
  IconStar,
} from "@tabler/icons-react";
import { NotificationsBell } from "@/components/NotificationsBell";
import { ProfileModal } from "@/components/ProfileModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel", icon: IconLayoutDashboard },
  { href: "/tasks", label: "Görevler", icon: IconChecklist },
  { href: "/calendar", label: "Çekim takvimi", icon: IconCalendarEvent },
  { href: "/clients", label: "Müşteriler", icon: IconBuildingStore },
  { href: "/team", label: "Ekip", icon: IconUsers },
  { href: "/influencers", label: "Influencer", icon: IconStar },
  { href: "/drive", label: "Drive", icon: IconBrandGoogleDrive },
];

interface CurrentMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  whatsapp_notifications_enabled?: boolean;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function Sidebar({ currentMember }: { currentMember: CurrentMember | null }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className="w-[200px] shrink-0 bg-white border-r border-black/5 flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-6 h-6 rounded-md bg-mia" />
        <span className="font-display font-medium text-base">Mia</span>
      </div>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "bg-mia text-white font-medium"
                : "text-black/60 hover:bg-black/5"
            }`}
          >
            <Icon size={17} stroke={1.75} />
            {label}
          </Link>
        );
      })}

      <div className="flex-1" />

      <NotificationsBell memberId={currentMember?.id ?? null} />

      {currentMember ? (
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-black/5"
        >
          {currentMember.avatar_url ? (
            <img
              src={currentMember.avatar_url}
              alt={currentMember.name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-mia-light text-mia text-[10px] font-medium flex items-center justify-center shrink-0">
              {initials(currentMember.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-medium text-black/80 truncate">{currentMember.name}</div>
            <div className="text-[10px] text-black/40">Profil & ayarlar</div>
          </div>
        </button>
      ) : (
        <div className="px-2 py-2 text-xs text-black/30">Profil bulunamadı</div>
      )}

      {profileOpen && currentMember && (
        <ProfileModal member={currentMember} onClose={() => setProfileOpen(false)} />
      )}
    </aside>
  );
}
