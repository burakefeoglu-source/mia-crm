import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClientAction } from "@/lib/actions/core";

export default function NewClientPage() {
  return (
    <div className="max-w-md">
      <Link href="/clients" className="flex items-center gap-1 text-sm text-black/40 mb-4">
        <IconArrowLeft size={15} /> Müşteriler
      </Link>
      <h1 className="font-display text-xl font-medium mb-6">Yeni müşteri</h1>

      <form action={createClientAction} className="flex flex-col gap-4">
        <label className="text-sm text-black/60">
          Marka adı
          <input
            name="name"
            required
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <label className="text-sm text-black/60">
          Sektör
          <select
            name="sector"
            defaultValue="other"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
          >
            <option value="fnb">F&B</option>
            <option value="hotel">Otel</option>
            <option value="jewelry">Mücevher</option>
            <option value="other">Diğer</option>
          </select>
        </label>

        <button
          type="submit"
          className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 mt-2"
        >
          Müşteri ekle
        </button>
      </form>
    </div>
  );
}
