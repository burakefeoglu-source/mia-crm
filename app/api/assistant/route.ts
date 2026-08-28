import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOverdueTasks, getUnderStaffedShoots, getWorkloadByMember } from "@/lib/pm-insights";

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tasks }, { data: shoots }, { data: members }, { data: clients }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, clients(name), task_assignees(team_members(id, name))")
      .gte("task_date", today.slice(0, 8) + "01")
      .order("task_date"),
    supabase
      .from("shoots")
      .select("*, shoot_team(team_member_id), shoot_clients(clients(name))")
      .gte("shoot_date", today),
    supabase.from("team_members").select("id, name, role, email"),
    supabase.from("clients").select("id, name").eq("is_active", true),
  ]);

  const currentMember = (members ?? []).find(
    (m) => m.email?.toLowerCase() === user.email?.toLowerCase()
  ) ?? null;

  const overdue = getOverdueTasks(tasks ?? []);
  const understaffed = getUnderStaffedShoots(shoots ?? []);
  const workload = getWorkloadByMember(tasks ?? [], members ?? []);

  const snapshot = {
    bugun: today,
    geciken_gorevler: overdue.map((t) => ({
      baslik: t.title,
      musteri: t.clients?.name ?? null,
      tarih: t.task_date,
      atanan: t.task_assignees?.map((a) => a.team_members?.name).filter(Boolean),
    })),
    eksik_detayli_cekimler: understaffed.map((s) => ({
      baslik: s.title,
      tarih: s.shoot_date,
      ekip_atanmis_mi: !!s.shoot_team?.length,
      konum_var_mi: !!s.location,
    })),
    ekip_is_yuku: workload.list,
    dengesiz_kisiler: workload.imbalanced.map((m) => m.name),
    tum_aktif_gorevler: (tasks ?? [])
      .filter((t) => t.status !== "done")
      .map((t) => ({
        baslik: t.title,
        musteri: t.clients?.name ?? null,
        durum: t.status,
        tarih: t.task_date,
        saat: t.start_time,
        atanan: t.task_assignees?.map((a: any) => a.team_members?.name).filter(Boolean),
      })),
    yaklasan_cekimler: (shoots ?? []).map((s: any) => ({
      baslik: s.title,
      tarih: s.shoot_date,
      musteriler: s.shoot_clients?.map((sc: any) => sc.clients?.name).filter(Boolean),
    })),
    ekip: members?.map((m) => m.name),
    musteriler: clients?.map((c) => c.name),
  };

  const systemPrompt = `Sen Mia Digital Solutions ajansı için çalışan bir AI Proje Yöneticisisin. Görevin, ajansın görev ve çekim verilerini analiz edip ekibin sorularını yanıtlamak, riskleri belirtmek ve pratik öneriler sunmak.

Şu an seninle konuşan kişi: ${currentMember ? `${currentMember.name} (${currentMember.role})` : "kimliği belirlenemeyen bir kullanıcı"}.
"Benim görevlerim", "bugün ne yapmalıyım" gibi birinci şahıs sorularında bu kişiye ait görevleri filtrele ve ona hitap et (sen dilinde, ismiyle). Genel ekip durumu sorulursa herkesi kapsayan cevap ver.

Kurallar:
- Türkçe, net ve kısa cevap ver. Gereksiz uzatma.
- Sadece aşağıda verilen veriye dayan, uydurma bilgi verme.
- Riskli/geciken durumları fark ettiğinde nazikçe ama net şekilde belirt.
- Somut öneri ver ("X kişisine yük az, Y'ye devredilebilir" gibi).
- Bir ekip üyesiyle konuşuyorsan (yönetici değil), üslubun destekleyici olsun — suçlayıcı ya da yargılayıcı değil.

Güncel veri (JSON):
${JSON.stringify(snapshot)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          ...(history ?? []),
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Claude API hatası:", err);
      return NextResponse.json({ error: "AI yanıtı alınamadı" }, { status: 500 });
    }

    const data = await res.json();
    const textBlock = data.content?.find((b: any) => b.type === "text");

    return NextResponse.json({
      reply: textBlock?.text ?? "Cevap üretilemedi.",
      insights: {
        overdueCount: overdue.length,
        understaffedCount: understaffed.length,
        imbalancedCount: workload.imbalanced.length,
      },
    });
  } catch (err) {
    console.error("Asistan hatası:", err);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
