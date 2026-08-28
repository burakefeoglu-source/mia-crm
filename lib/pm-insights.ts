// Deterministik risk tespiti — AI kullanmadan hesaplanır, hızlı ve güvenilir.

interface Task {
  id: string;
  title: string;
  status: string;
  task_date: string;
  start_time: string;
  duration_minutes: number;
  clients?: { name: string } | null;
  task_assignees?: { team_members: { id: string; name: string } | null }[];
}

interface Shoot {
  id: string;
  title: string | null;
  shoot_date: string;
  shoot_team?: { team_member_id: string }[];
  location: string | null;
}

export function getOverdueTasks(tasks: Task[]) {
  const now = new Date();
  return tasks.filter((t) => {
    if (t.status === "done") return false;
    const [h, m] = t.start_time.split(":").map(Number);
    const taskEnd = new Date(`${t.task_date}T00:00:00`);
    taskEnd.setMinutes(h * 60 + m + t.duration_minutes);
    return taskEnd < now;
  });
}

export function getUnderStaffedShoots(shoots: Shoot[]) {
  const today = new Date().toISOString().slice(0, 10);
  return shoots.filter(
    (s) => s.shoot_date >= today && (!s.shoot_team?.length || !s.location)
  );
}

export function getWorkloadByMember(
  tasks: Task[],
  members: { id: string; name: string }[]
) {
  const counts: Record<string, number> = {};
  for (const m of members) counts[m.id] = 0;

  for (const t of tasks) {
    if (t.status === "done") continue;
    for (const a of t.task_assignees ?? []) {
      const id = a.team_members?.id;
      if (id && id in counts) counts[id]++;
    }
  }

  const list = members.map((m) => ({ id: m.id, name: m.name, count: counts[m.id] ?? 0 }));
  const avg = list.reduce((sum, m) => sum + m.count, 0) / (list.length || 1);
  const imbalanced = list.filter((m) => m.count > avg * 1.8 && m.count >= 3);

  return { list, imbalanced };
}
