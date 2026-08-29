"use client";

import { useRef, useState, useTransition } from "react";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  addTeamLeaveAction,
  removeTeamLeaveAction,
} from "@/lib/actions/core";
import { IconTrash, IconX } from "@tabler/icons-react";

interface Leave {
  id: string;
  start_date: string;
  end_date: string;
  note: string | null;
}

interface TeamMemberInitial {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  leaves?: Leave[];
}

export function TeamMemberForm({
  onDone,
  initial,
  onDelete,
}: {
  onDone: () => void;
  initial?: TeamMemberInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [leaves, setLeaves] = useState<Leave[]>(initial?.leaves ?? []);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateTeamMemberAction(initial.id, formData);
      } else {
        await createTeamMemberAction(formData);
        formRef.current?.reset();
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm(`${initial.name} ekipten çıkarılsın mı?`)) return;
    startTransition(async () => {
      await deleteTeamMemberAction(initial.id);
      onDelete();
    });
  };

  const addLeave = () => {
    if (!initial || !leaveStart || !leaveEnd) return;
    const fd = new FormData();
    fd.set("start_date", leaveStart);
    fd.set("end_date", leaveEnd);
    startTransition(async () => {
      await addTeamLeaveAction(initial.id, fd);
      setLeaves((prev) => [...prev, { id: crypto.randomUUID(), start_date: leaveStart, end_date: leaveEnd, note: null }]);
      setLeaveStart("");
      setLeaveEnd("");
    });
  };

  const removeLeave = (id: string) => {
    startTransition(async () => {
      await removeTeamLeaveAction(id);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        İsim
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Rol
        <select
          name="role"
          defaultValue={initial?.role ?? "video"}
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
          defaultValue={initial?.email}
          placeholder="ad@miadigital.com"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Telefon (WhatsApp)
        <input
          name="phone"
          type="tel"
          defaultValue={initial?.phone ?? ""}
          placeholder="+90 5xx xxx xx xx"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Profil fotoğrafı (link)
        <input
          name="avatar_url"
          type="url"
          defaultValue={initial?.avatar_url ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      {initial && (
        <div className="text-sm text-black/60">
          <div className="mb-1.5">İzinli olduğu tarihler</div>
          <div className="flex flex-col gap-1 mb-2">
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center gap-2 bg-black/[0.03] rounded-lg px-2.5 py-2 text-xs">
                <span className="flex-1">{l.start_date} → {l.end_date}</span>
                <button
                  type="button"
                  onClick={() => removeLeave(l.id)}
                  className="text-black/30 hover:text-red-500"
                >
                  <IconX size={13} />
                </button>
              </div>
            ))}
            {!leaves.length && <div className="text-xs text-black/30">Kayıtlı izin yok.</div>}
          </div>
          <div className="flex gap-1.5">
            <input
              type="date"
              value={leaveStart}
              onChange={(e) => setLeaveStart(e.target.value)}
              className="flex-1 border border-black/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-mia"
            />
            <input
              type="date"
              value={leaveEnd}
              onChange={(e) => setLeaveEnd(e.target.value)}
              className="flex-1 border border-black/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-mia"
            />
            <button
              type="button"
              onClick={addLeave}
              disabled={!leaveStart || !leaveEnd || pending}
              className="text-xs bg-black/5 text-black/60 px-3 rounded-lg disabled:opacity-50"
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        {initial && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="w-11 flex items-center justify-center border border-black/10 text-red-500 rounded-lg disabled:opacity-50"
          >
            <IconTrash size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-mia text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Ekle"}
        </button>
      </div>
    </form>
  );
}
