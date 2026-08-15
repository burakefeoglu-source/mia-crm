import { createClient } from "@/lib/supabase/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";

// Kampanyayı ve seçilen influencer'ları müşteriye sunulabilir bir PDF'e döker.
// Marka kimliği: #000DFF vurgu, sade beyaz zemin.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, clients(name), campaign_influencers(budget, influencers(name, nickname, instagram_url, tiktok_url, youtube_url))")
    .eq("id", params.id)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mia = rgb(0 / 255, 13 / 255, 255 / 255);

  let y = 780;

  page.drawText("Mia Digital Solutions", { x: 50, y, size: 12, font: bold, color: mia });
  y -= 30;
  page.drawText(campaign.title, { x: 50, y, size: 20, font: bold, color: rgb(0.05, 0.05, 0.05) });
  y -= 20;
  page.drawText(`Müşteri: ${(campaign as any).clients?.name ?? "-"}`, {
    x: 50,
    y,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 40;

  page.drawText("Önerilen influencer'lar", { x: 50, y, size: 13, font: bold });
  y -= 25;

  const influencers = (campaign as any).campaign_influencers ?? [];
  for (const ci of influencers) {
    const inf = ci.influencers;
    page.drawText(`${inf.name}${inf.nickname ? ` (@${inf.nickname})` : ""}`, {
      x: 50,
      y,
      size: 12,
      font: bold,
    });
    y -= 16;
    const socials = [inf.instagram_url, inf.tiktok_url, inf.youtube_url].filter(Boolean).join("  ·  ");
    if (socials) {
      page.drawText(socials, { x: 50, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }
    if (ci.budget) {
      page.drawText(`Bütçe: ${ci.budget.toLocaleString("tr-TR")} TL`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 14;
    }
    y -= 12;
  }

  const bytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${campaign.title.replace(/\s+/g, "_")}.pdf"`,
    },
  });
}
