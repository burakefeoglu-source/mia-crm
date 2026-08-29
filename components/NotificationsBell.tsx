"use client";

import { useState, useEffect, useRef } from "react";
import { IconBell } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export function NotificationsBell({ memberId }: { memberId: string | null }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!memberId) return;
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("*")
      .eq("team_member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data ?? []));

    const channel = supabase
      .channel(`notifications-${memberId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `team_member_id=eq.${memberId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAllRead = async () => {
    if (!memberId) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("team_member_id", memberId).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  if (!memberId) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-black/60 hover:bg-black/5 relative"
      >
        <IconBell size={17} stroke={1.75} />
        <span className="text-sm">Bildirimler</span>
        {unreadCount > 0 && (
          <span className="ml-auto text-[10px] bg-mia text-white rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <span className="text-sm font-medium">Bildirimler</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-mia hover:underline">
                Hepsini okundu işaretle
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                onClick={() => {
                  markOneRead(n.id);
                  setOpen(false);
                }}
                className={`block px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] ${
                  !n.is_read ? "bg-mia-light/30" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-mia mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-black/80">{n.title}</div>
                    {n.body && <div className="text-xs text-black/50 truncate">{n.body}</div>}
                    <div className="text-[10px] text-black/30 mt-0.5">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              </Link>
            ))}
            {!notifications.length && (
              <div className="px-4 py-8 text-center text-xs text-black/30">Henüz bildirim yok.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
