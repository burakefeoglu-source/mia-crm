import type { TaskStatus } from "@/lib/supabase/types";

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "bekliyor", className: "bg-black/5 text-black/60" },
  in_progress: { label: "devam ediyor", className: "bg-amber-100 text-amber-700" },
  revision: { label: "revize", className: "bg-red-100 text-red-700" },
  done: { label: "tamamlandı", className: "bg-green-100 text-green-700" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
