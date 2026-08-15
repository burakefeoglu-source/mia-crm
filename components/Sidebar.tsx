"use client";

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

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel", icon: IconLayoutDashboard },
  { href: "/tasks", label: "Görevler", icon: IconChecklist },
  { href: "/calendar", label: "Çekim takvimi", icon: IconCalendarEvent },
  { href: "/clients", label: "Müşteriler", icon: IconBuildingStore },
  { href: "/team", label: "Ekip", icon: IconUsers },
  { href: "/influencers", label: "Influencer", icon: IconStar },
  { href: "/drive", label: "Drive", icon: IconBrandGoogleDrive },
];

export function Sidebar() {
  const pathname = usePathname();

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
    </aside>
  );
}
