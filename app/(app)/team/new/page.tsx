import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createTeamMemberAction } from "@/lib/actions/core";

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-md">
      <Link href="/team" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Ekip
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Ekip üyesi ekle</h1>

      <form action={createTeamMemberAction} className="flex flex-col gap-4">
        <label className="text-sm text-black/60">
          İsim
          <input
            name="name"
            required
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Rol
          <select
            name="role"
            defaultValue="video"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
          >
            <option value="video">Video</option>
            <option value="edit">Kurgu</option>
            <option value="design">Tasarım</option>
            <option value="social">Sosyal medya</option>
            <option value="brand_management">Marka yönetimi</option>
          </select>
        </label>

        <label className="text-sm text-black/60">
          E-posta
          <input
            name="email"
            type="email"
            required
            placeholder="ad@miadigital.com"
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
