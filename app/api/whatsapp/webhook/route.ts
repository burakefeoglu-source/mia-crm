import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { extractTaskFromMessage } from "@/lib/task-extraction";
import { notifyTaskAssignees, createInAppNotifications } from "@/lib/notifications";
import { getAverageDurationForMember, estimateCompletionTime } from "@/lib/task-estimation";

const DURATION_PRESET_MINUTES: Record<string, number> = {
  half_day: 240,
  full_day: 480,
  two_days: 960,
};

// Meta, webhook'u bağlarken bu GET isteğiyle doğrular.
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Doğrulama başarısız", { status: 403 });
}

// Gelen WhatsApp mesajlarını işler.
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    // Durum güncellemeleri (okundu/iletildi) de bu webhook'a düşer, sadece gerçek mesajları işle.
    if (!message || message.type !== "text") {
      return NextResponse.json({ ok: true });
    }

    const fromNumber: string = message.from; // örn. "905320000001"
    const text: string = message.text?.body ?? "";

    const supabase = createAdminClient();

    const { data: msgRow } = await supabase
      .from("whatsapp_messages")
      .insert({ from_number: fromNumber, raw_text: text, status: "received" })
      .select()
      .single();

    const [{ data: clients }, { data: members }] = await Promise.all([
      supabase.from("clients").select("id, name").eq("is_active", true),
      supabase.from("team_members").select("id, name, phone"),
    ]);

    const extracted = await extractTaskFromMessage(text, clients ?? [], members ?? []);

    if (!extracted) {
      await sendWhatsAppMessage(
        fromNumber,
        "Mesajını anlayamadım, tekrar dener misin? (örn: 'Yarın 14:00 Lagune Otel için reels kurgu, Ece'ye ata')"
      );
      if (msgRow) {
        await supabase.from("whatsapp_messages").update({ status: "failed" }).eq("id", msgRow.id);
      }
      return NextResponse.json({ ok: true });
    }

    if (extracted.needs_clarification || !extracted.task_date) {
      const reply = extracted.clarification_message ?? "Görev için tarih veya başlık net değil, tekrar yazar mısın?";
      await sendWhatsAppMessage(fromNumber, reply);
      if (msgRow) {
        await supabase
          .from("whatsapp_messages")
          .update({ status: "clarification_needed", reply_text: reply })
          .eq("id", msgRow.id);
      }
      return NextResponse.json({ ok: true });
    }

    const matchedClient = (clients ?? []).find(
      (c) => c.name.toLowerCase() === extracted.client_name?.toLowerCase()
    );
    const matchedAssignees = (members ?? []).filter((m) =>
      extracted.assignee_names.some((name) => name.toLowerCase() === m.name.toLowerCase())
    );

    let durationMinutes: number;
    if (extracted.duration_preset !== "custom") {
      durationMinutes = DURATION_PRESET_MINUTES[extracted.duration_preset];
    } else if (extracted.duration_minutes) {
      durationMinutes = extracted.duration_minutes;
    } else if (matchedAssignees[0]) {
      // Süre belirtilmemiş — o kişinin geçmiş görevlerine bakıp ortalama süreyi tahmin et.
      durationMinutes = await getAverageDurationForMember(supabase, matchedAssignees[0].id);
    } else {
      durationMinutes = 60;
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: extracted.title,
        client_id: matchedClient?.id ?? null,
        task_date: extracted.task_date,
        start_time: extracted.start_time ?? "09:00",
        duration_minutes: durationMinutes,
        duration_preset: extracted.duration_preset,
        status: "todo",
      })
      .select()
      .single();

    if (error || !task) {
      await sendWhatsAppMessage(fromNumber, "Görev oluşturulurken bir hata oluştu, tekrar dener misin?");
      if (msgRow) {
        await supabase.from("whatsapp_messages").update({ status: "failed" }).eq("id", msgRow.id);
      }
      return NextResponse.json({ ok: true });
    }

    if (matchedAssignees.length) {
      await supabase.from("task_assignees").insert(
        matchedAssignees.map((m) => ({ task_id: task.id, team_member_id: m.id }))
      );
      // Görevi oluşturan kişi (mesajı atan) hariç, diğer atanan kişilere de bildirim gönder.
      const otherAssignees = matchedAssignees.filter((m) => m.phone?.replace(/[^0-9]/g, "") !== fromNumber);
      await notifyTaskAssignees(
        supabase,
        task,
        otherAssignees.map((m) => m.id)
      );
      await createInAppNotifications(
        supabase,
        matchedAssignees.map((m) => m.id),
        { type: "task_assigned", title: "Yeni görev atandı (WhatsApp)", body: task.title, link: "/tasks" }
      );
    }

    let estimateLine: string | null = null;
    if (matchedAssignees[0]) {
      const estimate = await estimateCompletionTime(supabase, matchedAssignees[0].id, durationMinutes);
      estimateLine = `Tahmini bitiş: ${estimate.estimatedDate} · ${estimate.estimatedTime}${
        estimate.tasksAhead > 0 ? ` (${estimate.tasksAhead} iş sırada)` : ""
      }`;
    }

    const confirmationParts = [
      `✅ Görev oluşturuldu: "${extracted.title}"`,
      matchedClient ? `Müşteri: ${matchedClient.name}` : null,
      matchedAssignees.length ? `Atanan: ${matchedAssignees.map((m) => m.name).join(", ")}` : "Atanan kişi belirtilmedi",
      `Tarih: ${extracted.task_date} · ${extracted.start_time ?? "09:00"} · ${durationMinutes} dk`,
      estimateLine,
    ].filter(Boolean);

    const confirmation = confirmationParts.join("\n");
    await sendWhatsAppMessage(fromNumber, confirmation);

    if (msgRow) {
      await supabase
        .from("whatsapp_messages")
        .update({ status: "created", parsed_task_id: task.id, reply_text: confirmation })
        .eq("id", msgRow.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WhatsApp webhook hatası:", err);
    return NextResponse.json({ ok: true }); // Meta'ya her zaman 200 dön, aksi halde tekrar dener
  }
}
