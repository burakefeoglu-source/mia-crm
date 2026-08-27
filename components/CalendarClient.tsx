"use client";

import { useState, useMemo, useEffect } from "react";
import { IconVideo, IconCamera, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { ShootForm } from "@/components/forms/ShootForm";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ViewMode = "month" | "week" | "day";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shootToInitial(shoot: any, filesByShoot: Record<string, any[]>) {
  return {
    id: shoot.id,
    title: shoot.title,
    shoot_date: shoot.shoot_date,
    start_time: shoot.start_time,
    end_time: shoot.end_time,
    location: shoot.location,
    shoot_type: shoot.shoot_type,
    is_outdoor: shoot.is_outdoor ?? false,
    notes: shoot.notes,
    clientIds: shoot.shoot_clients?.map((sc: any) => sc.clients?.id ?? sc.client_id).filter(Boolean) ?? [],
    teamIds: shoot.shoot_team?.map((st: any) => st.team_members?.id ?? st.team_member_id).filter(Boolean) ?? [],
    linkedFiles: filesByShoot[shoot.id] ?? [],
  };
}

export function CalendarClient({
  shoots,
  clients,
  members,
  filesByShoot,
}: {
  shoots: any[];
  clients: { id: string; name: string }[];
  members: { id: string; name: string }[];
  filesByShoot: Record<string, any[]>;
}) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(new Date());
  const [editingShoot, setEditingShoot] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("calendar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "shoots" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const onCreated = () => router.refresh();
  const closeEdit = () => {
    setEditingShoot(null);
    router.refresh();
  };

  const shootsByDate = useMemo(() => {
    return shoots.reduce<Record<string, any[]>>((acc, s: any) => {
      (acc[s.shoot_date] ??= []).push(s);
      return acc;
    }, {});
  }, [shoots]);

  const navigate = (dir: 1 | -1) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-medium mb-1">Çekim takvimi</h1>
          <p className="text-sm text-black/50">Video / foto çekim planlaması.</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-black/40 hover:text-black/60">
              <IconChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium min-w-[140px]">
              {view === "month" && `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`}
              {view !== "month" && cursor.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            </span>
            <button onClick={() => navigate(1)} className="text-black/40 hover:text-black/60">
              <IconChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-1 bg-black/[0.04] rounded-lg p-1">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-3 py-1.5 rounded-md ${
                  view === v ? "bg-white shadow-sm font-medium" : "text-black/50"
                }`}
              >
                {v === "month" ? "Aylık" : v === "week" ? "Haftalık" : "Günlük"}
              </button>
            ))}
          </div>
        </div>

        {view === "month" && (
          <MonthView cursor={cursor} shootsByDate={shootsByDate} onSelect={setEditingShoot} />
        )}
        {view === "week" && (
          <WeekView cursor={cursor} shootsByDate={shootsByDate} onSelect={setEditingShoot} />
        )}
        {view === "day" && (
          <DayView cursor={cursor} shootsByDate={shootsByDate} onSelect={setEditingShoot} />
        )}
      </div>

      <div className="w-[320px] shrink-0 bg-white border border-black/5 rounded-2xl p-5 h-fit shadow-sm">
        <div className="text-sm font-medium text-black/80 mb-4">Yeni çekim</div>
        <ShootForm clients={clients} members={members} onDone={onCreated} />
      </div>

      {editingShoot && (
        <Modal title="Çekimi düzenle" onClose={closeEdit}>
          <ShootForm
            clients={clients}
            members={members}
            onDone={closeEdit}
            onDelete={closeEdit}
            initial={shootToInitial(editingShoot, filesByShoot)}
          />
        </Modal>
      )}
    </div>
  );
}

function MonthView({
  cursor,
  shootsByDate,
  onSelect,
}: {
  cursor: Date;
  shootsByDate: Record<string, any[]>;
  onSelect: (s: any) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = fmt(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-xs text-black/40 text-center font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayShoots = shootsByDate[dateStr] ?? [];
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={`min-h-[90px] rounded-lg p-1.5 border ${
                isToday ? "border-mia bg-mia-light/30" : "border-black/5 bg-white"
              }`}
            >
              <div className={`text-[11px] mb-1 ${isToday ? "text-mia font-medium" : "text-black/40"}`}>{d}</div>
              <div className="flex flex-col gap-1">
                {dayShoots.slice(0, 3).map((s) => {
                  const Icon = s.shoot_type === "video" ? IconVideo : IconCamera;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelect(s)}
                      className="bg-white border border-black/5 rounded-md px-1.5 py-1 text-[10px] flex items-center gap-1 truncate hover:border-mia/40 text-left"
                    >
                      <Icon size={11} className="text-mia shrink-0" />
                      <span className="truncate">{s.title || "Çekim"}</span>
                    </button>
                  );
                })}
                {dayShoots.length > 3 && (
                  <div className="text-[10px] text-black/40">+{dayShoots.length - 3} daha</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  cursor,
  shootsByDate,
  onSelect,
}: {
  cursor: Date;
  shootsByDate: Record<string, any[]>;
  onSelect: (s: any) => void;
}) {
  const day = cursor.getDay() === 0 ? 7 : cursor.getDay();
  const monday = new Date(cursor);
  monday.setDate(cursor.getDate() - day + 1);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDates.map((d, i) => {
        const dateStr = fmt(d);
        const dayShoots = shootsByDate[dateStr] ?? [];
        return (
          <div key={dateStr} className="min-h-[220px]">
            <div className="text-xs font-medium text-black/40 mb-2">
              {DAY_LABELS[i]} · {String(d.getDate()).padStart(2, "0")}
            </div>
            <div className="flex flex-col gap-2">
              {dayShoots.map((shoot) => {
                const Icon = shoot.shoot_type === "video" ? IconVideo : IconCamera;
                return (
                  <button
                    key={shoot.id}
                    onClick={() => onSelect(shoot)}
                    className="text-left bg-white border border-black/5 rounded-lg p-2.5 text-xs hover:border-mia/40"
                  >
                    <Icon size={14} className="text-mia mb-1" />
                    <div className="font-medium mb-0.5">{shoot.title || "Çekim"}</div>
                    <div className="text-black/50">{shoot.start_time?.slice(0, 5)}</div>
                    {shoot.location && <div className="text-black/50">{shoot.location}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  cursor,
  shootsByDate,
  onSelect,
}: {
  cursor: Date;
  shootsByDate: Record<string, any[]>;
  onSelect: (s: any) => void;
}) {
  const dateStr = fmt(cursor);
  const dayShoots = (shootsByDate[dateStr] ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="flex flex-col gap-2">
      {dayShoots.map((shoot) => {
        const Icon = shoot.shoot_type === "video" ? IconVideo : IconCamera;
        return (
          <button
            key={shoot.id}
            onClick={() => onSelect(shoot)}
            className="text-left bg-white border border-black/5 rounded-xl p-4 flex items-center gap-3 hover:border-mia/40"
          >
            <Icon size={18} className="text-mia shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{shoot.title || "Çekim"}</div>
              <div className="text-xs text-black/50">
                {shoot.start_time?.slice(0, 5)}–{shoot.end_time?.slice(0, 5)}
                {shoot.location && ` · ${shoot.location}`}
              </div>
            </div>
          </button>
        );
      })}
      {!dayShoots.length && <div className="text-center text-sm text-black/40 py-10">Bu gün için çekim yok.</div>}
    </div>
  );
}
