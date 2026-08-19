"use client";

import { useState, useTransition } from "react";
import { IconPlus } from "@tabler/icons-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { MiniCalendar } from "@/components/MiniCalendar";
import { TaskForm } from "@/components/forms/TaskForm";
import { createNoteAction } from "@/lib/actions/core";
import { useRouter } from "next/navigation";

interface Weather {
  temp: number;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  label: string;
  emoji: string;
}

interface Props {
  activeTasks: any[];
  upcomingShoots: any[];
  clients: { id: string; name: string }[];
  members: { id: string; name: string }[];
  activeNow: { id: string; name: string; task_title: string | null; client_name: string | null }[];
  notes: { id: string; content: string }[];
  markedDates: string[];
  weather: Weather | null;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function DashboardClient({
  activeTasks,
  upcomingShoots,
  clients,
  members,
  activeNow,
  notes,
  markedDates,
  weather,
}: Props) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    router.refresh();
  };

  const submitNote = () => {
    if (!noteText.trim()) return;
    const fd = new FormData();
    fd.set("content", noteText);
    startTransition(async () => {
      await createNoteAction(fd);
      setNoteText("");
      router.refresh();
    });
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-medium mb-1">
              Bugün, {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            </h1>
            <p className="text-sm text-black/50">
              {activeTasks.length} aktif görev, {upcomingShoots.length} çekim planlandı
            </p>
          </div>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 bg-mia text-white text-xs font-medium px-3 py-2 rounded-lg"
          >
            <IconPlus size={14} />
            Görev
          </button>
        </div>

        <h2 className="text-sm font-medium mb-3">Aktif görevler</h2>
        <div className="bg-white border border-black/5 rounded-xl overflow-hidden mb-8">
          {activeTasks.length ? (
            activeTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-4 py-3 border-b border-black/5 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium">
                    {task.title} {task.clients?.name && `— ${task.clients.name}`}
                  </div>
                  <div className="text-xs text-black/50">
                    {task.task_assignees?.map((a: any) => a.team_members?.name).filter(Boolean).join(", ") || "Atanmadı"}
                    {" · "}
                    {task.task_date} · {task.start_time?.slice(0, 5)}
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-black/40 text-center">Aktif görev yok.</div>
          )}
        </div>

        <h2 className="text-sm font-medium mb-3">Yaklaşan çekimler</h2>
        <div className="flex flex-col gap-2">
          {upcomingShoots.length ? (
            upcomingShoots.map((shoot) => (
              <div
                key={shoot.id}
                className="flex items-center gap-3 bg-white border border-black/5 rounded-lg px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium">
                    {shoot.title || (shoot.shoot_type === "video" ? "Video çekimi" : "Foto çekimi")}
                    {shoot.location && ` — ${shoot.location}`}
                  </div>
                  <div className="text-xs text-black/50">
                    {shoot.shoot_date} · {shoot.start_time?.slice(0, 5)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-black/40">Planlanmış çekim yok.</div>
          )}
        </div>
      </div>

      <div className="w-[260px] shrink-0 bg-white border border-black/5 rounded-2xl p-5 flex flex-col gap-6 h-fit shadow-sm">
        {weather && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-black/50 mb-0.5">İstanbul</div>
                <div className="text-2xl font-display font-medium">{weather.temp}°</div>
                <div className="text-[11px] text-black/45">{weather.label}</div>
              </div>
              <div className="text-3xl">{weather.emoji}</div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-black/45 -mt-3">
              <span>↑{weather.tempMax}° ↓{weather.tempMin}°</span>
              {weather.rainChance > 30 && <span>💧 %{weather.rainChance}</span>}
            </div>
            <div className="h-px bg-black/[0.06]" />
          </>
        )}

        <MiniCalendar markedDates={markedDates} />

        <div className="h-px bg-black/[0.06]" />

        <div>
          <div className="text-xs font-medium text-black/70 mb-3">Şu an ne yapıyor</div>
          <div className="flex flex-col gap-3">
            {activeNow.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${
                    m.task_title ? "bg-mia-light text-mia" : "bg-black/[0.04] text-black/35"
                  }`}
                >
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-black/80 truncate">{m.name}</div>
                  <div className="text-[11px] text-black/40 truncate">
                    {m.task_title ? `${m.task_title}${m.client_name ? " · " + m.client_name : ""}` : "Boşta"}
                  </div>
                </div>
              </div>
            ))}
            {!activeNow.length && <div className="text-[11px] text-black/30">Ekip yok</div>}
          </div>
        </div>

        <div className="h-px bg-black/[0.06]" />

        <div>
          <div className="text-xs font-medium text-black/70 mb-3">Notlar</div>
          <div className="flex flex-col gap-2 mb-3">
            {notes.map((n) => (
              <div key={n.id} className="bg-black/[0.03] rounded-xl px-3 py-2.5 text-[11px] text-black/65 leading-relaxed">
                {n.content}
              </div>
            ))}
            {!notes.length && <div className="text-[11px] text-black/30">Henüz not yok.</div>}
          </div>
          <div className="flex gap-1.5">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNote()}
              placeholder="Not ekle…"
              className="flex-1 min-w-0 border border-black/10 rounded-lg px-2.5 py-2 text-[11px] outline-none focus:border-mia"
            />
            <button
              onClick={submitNote}
              disabled={pending}
              className="text-[11px] font-medium bg-mia text-white px-3 rounded-lg disabled:opacity-50 shrink-0"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {taskModalOpen && (
        <Modal title="Yeni görev" onClose={closeTaskModal}>
          <TaskForm clients={clients} members={members} onDone={closeTaskModal} />
        </Modal>
      )}
    </div>
  );
}
