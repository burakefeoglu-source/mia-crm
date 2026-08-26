// Meta WhatsApp Business Cloud API üzerinden mesaj gönderme.
export async function sendWhatsAppMessage(to: string, text: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp gönderim hatası:", err);
  }

  return res.ok;
}

// Ajans tarafından başlatılan bildirimler için — onaylı şablon kullanır.
// (Serbest metin, alıcı son 24 saatte mesaj atmadıysa Meta tarafından reddedilir.)
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "tr" },
          components: [
            {
              type: "body",
              parameters: params.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp şablon gönderim hatası:", err);
  }

  return res.ok;
}
