import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createInfluencerAction } from "@/lib/actions/influencers";

export default function NewInfluencerPage() {
  return (
    <div className="max-w-md">
      <Link href="/influencers" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Influencer listesi
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Influencer ekle</h1>

      <form action={createInfluencerAction} className="flex flex-col gap-4">
        <label className="text-sm text-black/60">
          İsim
          <input
            name="name"
            required
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Nick
          <input
            name="nickname"
            placeholder="denizgezer"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Instagram linki
          <input
            name="instagram_url"
            type="url"
            placeholder="https://instagram.com/..."
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          TikTok linki
          <input
            name="tiktok_url"
            type="url"
            placeholder="https://tiktok.com/@..."
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          YouTube linki
          <input
            name="youtube_url"
            type="url"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Son çalışılan bütçe (TL)
          <input
            name="last_budget"
            type="number"
            min={0}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <button
          type="submit"
          className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2"
        >
          Ekle
        </button>
      </form>
    </div>
  );
}
