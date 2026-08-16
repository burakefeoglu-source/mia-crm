import { createClient } from "@/lib/supabase/server";
import { IconPlus, IconVideo, IconCamera } from "@tabler/icons-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default async function CalendarPage() {
  const supabase = createClient();
  const weekDates = getWeekDates();

  const { data: shoots } = await supabase
    .from("shoots")
    .select("*, shoot_clients(clients(name)), shoot_team(team_members(name))")
    .gte("shoot_date", weekDates[0])
    .lte("shoot_date", weekDates[6])
    .order("start_time");

  const shootsByDate = (shoots ?? []).reduce<Record<string, any[]>>((acc, shoot: any) => {
    (acc[shoot.shoot_date] ??= []).push(shoot);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Çekim takvimi</h1>
          <p className="text-sm text-black/50">Bu hafta planlanan video / foto çekimleri.</p>
        </div>
        <Link
          href="/calendar/new"
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Yeni çekim
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date, i) => (
          <div key={date} className="min-h-[220px]">
            <div className="text-xs font-medium text-black/40 mb-2">
              {DAY_LABELS[i]} · {date.slice(8, 10)}
            </div>
            <div className="flex flex-col gap-2">
              {(shootsByDate[date] ?? []).map((shoot) => {
                const Icon = shoot.shoot_type === "video" ? IconVideo : IconCamera;
                const clientNames = shoot.shoot_clients
                  ?.map((sc: any) => sc.clients?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div
                    key={shoot.id}
                    className="bg-white border border-black/5 rounded-lg p-2.5 text-xs"
                  >
                    <Icon size={14} className="text-mia mb-1" />
                    <div className="font-medium mb-0.5">{clientNames || "Müşteri yok"}</div>
                    <div className="text-black/50">{shoot.start_time?.slice(0, 5)}</div>
                    {shoot.location && <div className="text-black/50">{shoot.location}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
