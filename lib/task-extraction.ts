// WhatsApp mesaj metnini yapılandırılmış görev bilgisine çevirir.
// Maliyet düşük olsun diye Haiku kullanılıyor (basit extraction işi).

interface ExtractedTask {
  title: string;
  client_name: string | null;
  assignee_names: string[];
  task_date: string | null; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  duration_preset: "custom" | "half_day" | "full_day" | "two_days";
  duration_minutes: number | null;
  needs_clarification: boolean;
  clarification_message: string | null;
}

export async function extractTaskFromMessage(
  messageText: string,
  clients: { name: string }[],
  members: { name: string }[]
): Promise<ExtractedTask | null> {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }); // YYYY-MM-DD
  const weekday = new Date().toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long" });

  const systemPrompt = `Sen Mia Digital Solutions ajansının WhatsApp üzerinden gelen görev mesajlarını yapılandırılmış veriye çeviren asistanısın.

Bugünün tarihi: ${today} (${weekday})

Mevcut müşteriler: ${clients.map((c) => c.name).join(", ") || "yok"}
Mevcut ekip üyeleri: ${members.map((m) => m.name).join(", ") || "yok"}

Kullanıcının mesajından bir görev çıkar. SADECE aşağıdaki JSON formatında cevap ver, başka hiçbir metin ekleme:

{
  "title": "görev başlığı (kısa, net)",
  "client_name": "listedeki müşteri adı ile birebir eşleşen isim, yoksa null",
  "assignee_names": ["listedeki ekip üyesi adlarıyla birebir eşleşen isimler"],
  "task_date": "YYYY-MM-DD formatında, 'yarın'/'bugün'/gün isimleri gibi göreceli ifadeleri bugünün tarihine göre çöz",
  "start_time": "HH:MM formatında 24 saat, belirtilmemişse 09:00 varsay",
  "duration_preset": "custom, half_day, full_day, two_days içinden birini seç (yarım gün/1 gün/2 gün geçiyorsa onu kullan, yoksa custom)",
  "duration_minutes": "duration_preset custom ise dakika olarak süre, belirtilmemişse 60",
  "needs_clarification": "başlık veya tarih çıkarılamıyorsa true, aksi halde false",
  "clarification_message": "needs_clarification true ise Türkçe, kısa bir netleştirme sorusu; değilse null"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: messageText }],
      }),
    });

    if (!res.ok) {
      console.error("Claude API hatası:", await res.text());
      return null;
    }

    const data = await res.json();
    const textBlock = data.content?.find((b: any) => b.type === "text");
    if (!textBlock) return null;

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as ExtractedTask;
  } catch (err) {
    console.error("Görev çıkarma hatası:", err);
    return null;
  }
}
