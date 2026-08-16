"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInfluencerAction(formData: FormData) {
  const supabase = createClient();

  const lastBudget = formData.get("last_budget") as string;

  const { error } = await supabase.from("influencers").insert({
    name: formData.get("name") as string,
    nickname: (formData.get("nickname") as string) || null,
    instagram_url: (formData.get("instagram_url") as string) || null,
    tiktok_url: (formData.get("tiktok_url") as string) || null,
    youtube_url: (formData.get("youtube_url") as string) || null,
    last_budget: lastBudget ? Number(lastBudget) : null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/influencers");
}

export async function createCampaignAction(formData: FormData) {
  const supabase = createClient();

  const influencerIds = formData.getAll("influencer_ids") as string[];
  const clientId = formData.get("client_id") as string;

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      title: formData.get("title") as string,
      client_id: clientId || null,
      campaign_date: (formData.get("campaign_date") as string) || null,
      status: "planning",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (influencerIds.length) {
    const rows = influencerIds.map((influencer_id) => {
      const budget = formData.get(`budget_${influencer_id}`) as string;
      return {
        campaign_id: campaign.id,
        influencer_id,
        budget: budget ? Number(budget) : null,
      };
    });
    const { error: e1 } = await supabase.from("campaign_influencers").insert(rows);
    if (e1) throw new Error(e1.message);
  }

  revalidatePath("/influencers");
}
