// Görev süresi tahmini ve sıraya göre bitiş zamanı hesaplama.

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const WORK_MINUTES_PER_DAY = (WORK_END_HOUR - WORK_START_HOUR) * 60;

// Bir kişinin geçmiş tamamlanmış görevlerine bakıp ortalama süresini çıkarır.
export async function getAverageDurationForMember(
  supabase: any,
  memberId: string
): Promise<number> {
  const { data: personal } = await supabase
    .from("tasks")
    .select("duration_minutes, task_assignees!inner(team_member_id)")
    .eq("status", "done")
    .eq("task_assignees.team_member_id", memberId)
    .limit(50);

  if (personal?.length) {
    const avg = personal.reduce((sum: number, t: any) => sum + t.duration_minutes, 0) / personal.length;
    return Math.round(avg);
  }

  // Yeterli kişisel veri yoksa ajans geneli ortalamaya bak.
  const { data: general } = await supabase.from("tasks").select("duration_minutes").eq("status", "done").limit(100);
  if (general?.length) {
    const avg = general.reduce((sum: number, t: any) => sum + t.duration_minutes, 0) / general.length;
    return Math.round(avg);
  }

  return 60; // Hiç veri yoksa varsayılan
}

// Mesai saatlerine göre (09:00–18:00, hafta sonu hariç) N dakika ilerletir.
function addWorkingMinutes(start: Date, minutes: number): Date {
  let remaining = minutes;
  let cursor = new Date(start);

  // Başlangıç mesai saatleri dışındaysa bir sonraki mesai başlangıcına çek.
  const clampToWorkStart = (d: Date) => {
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() + 1); // Pazar -> Pazartesi
    if (day === 6) d.setDate(d.getDate() + 2); // Cumartesi -> Pazartesi
    d.setHours(WORK_START_HOUR, 0, 0, 0);
    return d;
  };

  if (cursor.getHours() < WORK_START_HOUR || cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor = clampToWorkStart(cursor);
  } else if (cursor.getHours() >= WORK_END_HOUR) {
    cursor.setDate(cursor.getDate() + 1);
    cursor = clampToWorkStart(cursor);
  }

  while (remaining > 0) {
    const minutesLeftToday = WORK_END_HOUR * 60 - (cursor.getHours() * 60 + cursor.getMinutes());
    if (remaining <= minutesLeftToday) {
      cursor.setMinutes(cursor.getMinutes() + remaining);
      remaining = 0;
    } else {
      remaining -= minutesLeftToday;
      cursor.setDate(cursor.getDate() + 1);
      cursor = clampToWorkStart(cursor);
    }
  }

  return cursor;
}

interface EstimateResult {
  estimatedDate: string;
  estimatedTime: string;
  tasksAhead: number;
}

// Bir kişinin sırasındaki bekleyen işlere bakıp yeni görevin gerçekçi bitiş zamanını hesaplar.
export async function estimateCompletionTime(
  supabase: any,
  memberId: string,
  newTaskDurationMinutes: number
): Promise<EstimateResult> {
  const { data: pending } = await supabase
    .from("tasks")
    .select("duration_minutes, task_assignees!inner(team_member_id)")
    .neq("status", "done")
    .eq("task_assignees.team_member_id", memberId);

  const tasksAhead = pending?.length ?? 0;
  const minutesAhead = (pending ?? []).reduce((sum: number, t: any) => sum + t.duration_minutes, 0);
  const totalMinutes = minutesAhead + newTaskDurationMinutes;

  const finish = addWorkingMinutes(new Date(), totalMinutes);

  return {
    estimatedDate: finish.toISOString().slice(0, 10),
    estimatedTime: finish.toTimeString().slice(0, 5),
    tasksAhead,
  };
}
