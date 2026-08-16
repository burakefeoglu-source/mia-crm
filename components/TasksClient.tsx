"use client";

import { useState, useMemo } from "react";
import { IconPlus } from "@tabler/icons-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SlideOver } from "@/components/SlideOver";
import { TaskForm } from "@/components/forms/TaskForm";
import { useRouter } from "next/navigation";

interface Props {
  tasks: any[];
  clients: { id: string; name: string }[];
  members: { id: string; name: string }[];
}

const STATUS_FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "todo", label: "Bekliyor" },
  { value: "in_progress", label: "Devam ediyor" },
  { value: "revision", label: "Revize" },
  { value: "done", label: "Tamamlandı" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function TasksClient({ tasks, clients, members }: Props) {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const router = useRouter();

  const close = () => {
    setOpen(false);
    router.refresh();
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (memberFilter !== "all") {
        const names = t.task_assignees?.map((a: any) => a.team_members?.id) ?? [];
        if (!names.includes(memberFilter)) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, memberFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-medium mb-1">Görevler</h1>
          <p className="text-sm text-black/50">Tüm görevler, kişi ve müşteri bazlı.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 bg-mia text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <IconPlus size={16} />
          Yeni görev
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              statusFilter === f.value
                ? "bg-mia text-white border-mia"
                : "border-black/10 text-black/50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-full border border-black/10 text-black/50 bg-white"
        >
          <option value="all">Herkes</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((task: any) => {
          const assignees = task.task_assignees?.map((a: any) => a.team_members).filter(Boolean) ?? [];
          return (
            <div
              key={task.id}
              className="bg-white border border-black/5 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-black/10 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex -space-x-1.5 shrink-0">
                  {assignees.length ? (
                    assignees.slice(0, 3).map((m: any, i: number) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-mia-light text-mia text-[10px] font-medium flex items-center justify-center border-2 border-white"
                      >
                        {initials(m.name)}
                      </div>
                    ))
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black/5 text-black/30 text-[10px] flex items-center justify-center border-2 border-white">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  <div className="text-xs text-black/45">
                    {task.clients?.name ?? "Müşteri yok"} · {task.task_date} · {task.start_time?.slice(0, 5)}
                  </div>
                </div>
              </div>
              <StatusBadge status={task.status} />
            </div>
          );
        })}
        {!filtered.length && (
          <div className="text-center text-sm text-black/40 py-10">Görev bulunamadı.</div>
        )}
      </div>

      {open && (
        <SlideOver title="Yeni görev" onClose={close}>
          <TaskForm clients={clients} members={members} onDone={close} />
        </SlideOver>
      )}
    </div>
  );
}
