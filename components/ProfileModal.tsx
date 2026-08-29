"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateOwnProfileAction } from "@/lib/actions/profile";
import { updateNotificationPrefAction } from "@/lib/actions/core";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { createClient } from "@/lib/supabase/client";
import { IconChecklist, IconLogout, IconBrandWhatsapp } from "@tabler/icons-react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  video: "Video",
  edit: "Kurgu",
  design: "Tasarım",
  social: "Sosyal medya",
  brand_management: "Marka yönetimi",
};

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  whatsapp_notifications_enabled?: boolean;
}

export function ProfileModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [avatar, setAvatar] = useState(member.avatar_url ?? "");
  const [notifEnabled, setNotifEnabled] = useState(member.whatsapp_notifications_enabled ?? true);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateOwnProfileAction(formData);
      router.refresh();
      onClose();
    });
  };

  const toggleNotifications = () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    startTransition(async () => {
      await updateNotificationPrefAction(next);
      router.refresh();
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Modal title="Profilim" onClose={onClose}>
      <form action={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover bg-black/5" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-mia-light text-mia font-display font-medium flex items-center justify-center text-lg">
              {member.name[0]}
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{member.name}</div>
            <div className="text-xs text-black/40">{ROLE_LABELS[member.role] ?? member.role}</div>
            <div className="text-xs text-black/40">{member.email}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-black/60 mb-2">Avatar seç</div>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_PRESETS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setAvatar(url)}
                className={`rounded-full overflow-hidden border-2 transition-colors ${
                  avatar === url ? "border-mia" : "border-transparent hover:border-black/10"
                }`}
              >
                <img src={url} alt="" className="w-full aspect-square object-cover bg-black/5" />
              </button>
            ))}
          </div>
          <input type="hidden" name="avatar_url" value={avatar} />
        </div>

        <label className="text-sm text-black/60">
          Telefon (WhatsApp)
          <input
            name="phone"
            type="tel"
            defaultValue={member.phone ?? ""}
            placeholder="+90 5xx xxx xx xx"
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>

        <div className="flex items-center justify-between border border-black/10 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-black/70">
            <IconBrandWhatsapp size={16} className="text-green-600" />
            WhatsApp bildirimleri
          </div>
          <button
            type="button"
            onClick={toggleNotifications}
            className={`w-10 h-6 rounded-full relative transition-colors ${
              notifEnabled ? "bg-mia" : "bg-black/15"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notifEnabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <Link
          href="/assistant"
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-black/60 border border-black/10 rounded-lg px-3 py-2.5 hover:bg-black/5"
        >
          <IconChecklist size={16} />
          Görevlerimi gör
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 text-sm text-red-500 border border-black/10 rounded-lg px-4 py-2.5"
          >
            <IconLogout size={15} />
            Çıkış yap
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-mia text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-50"
          >
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
