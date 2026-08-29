"use client";

import { useState, useRef, useTransition } from "react";
import { createTaskAction, updateTaskAction, deleteTaskAction } from "@/lib/actions/core";
import { linkFileAction, unlinkFileAction } from "@/lib/actions/files";
import { DrivePickerButton } from "@/components/DrivePickerButton";
import { IconTrash, IconBrandGoogleDrive, IconX } from "@tabler/icons-react";

interface Option {
  id: string;
  name: string;
}

interface MemberOption extends Option {
  leaves?: { start_date: string; end_date: string }[];
}

const DURATION_OPTIONS = [
  { value: "custom", label: "Özel" },
  { value: "half_day", label: "Yarım gün" },
  { value: "full_day", label: "1 gün" },
  { value: "two_days", label: "2 gün" },
];

interface LinkedFile {
  id: string;
  file_name: string;
  file_url: string;
}

interface TaskInitial {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  task_date: string;
  start_time: string;
  duration_minutes: number;
  duration_preset: string;
  status: string;
  assigneeIds: string[];
  linkedFiles?: LinkedFile[];
}

export function TaskForm({
  clients,
  members,
  onDone,
  initial,
  onDelete,
}: {
  clients: Option[];
  members: MemberOption[];
  onDone: () => void;
  initial?: TaskInitial;
  onDelete?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [preset, setPreset] = useState(initial?.duration_preset ?? "custom");
  const [files, setFiles] = useState<LinkedFile[]>(initial?.linkedFiles ?? []);
  const [taskDate, setTaskDate] = useState(initial?.task_date ?? "");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(initial?.assigneeIds ?? []);
  const [repeatFrequency, setRepeatFrequency] = useState("none");
  const formRef = useRef<HTMLFormElement>(null);

  const leaveConflicts = taskDate
    ? members.filter(
        (m) =>
          selectedAssignees.includes(m.id) &&
          m.leaves?.some((l) => l.start_date <= taskDate && l.end_date >= taskDate)
      )
    : [];

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (initial) {
        await updateTaskAction(initial.id, formData);
      } else {
        await createTaskAction(formData);
        formRef.current?.reset();
        setPreset("custom");
        setTaskDate("");
        setSelectedAssignees([]);
        setRepeatFrequency("none");
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    if (!confirm("Bu görevi silmek istediğine emin misin?")) return;
    startTransition(async () => {
      await deleteTaskAction(initial.id);
      onDelete();
    });
  };

  const handleFilePicked = (file: { id: string; name: string; url: string; mimeType?: string }) => {
    if (!initial) return;
    startTransition(async () => {
      await linkFileAction("task", initial.id, file);
      setFiles((prev) => [...prev, { id: file.id, file_name: file.name, file_url: file.url }]);
    });
  };

  const handleFileRemove = (linkedFileId: string) => {
    startTransition(async () => {
      await unlinkFileAction(linkedFileId);
      setFiles((prev) => prev.filter((f) => f.id !== linkedFileId));
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-black/60">
        Görev başlığı
        <input
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Reels kurgu"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Açıklama
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={2}
          placeholder="Görev detayları…"
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
        />
      </label>

      <label className="text-sm text-black/60">
        Müşteri
        <select
          name="client_id"
          defaultValue={initial?.client_id ?? ""}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="">Seçilmedi</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="text-sm text-black/60">
        Atanan kişiler (birden fazla seçebilirsin)
        <div className="mt-1.5 border border-black/10 rounded-lg p-2 max-h-32 overflow-y-auto flex flex-col gap-1">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm px-1.5 py-1">
              <input
                type="checkbox"
                name="assignee_ids"
                value={m.id}
                checked={selectedAssignees.includes(m.id)}
                onChange={(e) =>
                  setSelectedAssignees((prev) =>
                    e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                  )
                }
              />
              {m.name}
            </label>
          ))}
          {!members.length && <div className="text-xs text-black/30 px-1.5">Ekip yok</div>}
        </div>
        {leaveConflicts.length > 0 && (
          <div className="mt-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-2">
            ⚠️ {leaveConflicts.map((m) => m.name).join(", ")} bu tarihte izinli görünüyor.
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <label className="text-sm text-black/60 flex-1">
          Tarih
          <input
            type="date"
            name="task_date"
            required
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
        <label className="text-sm text-black/60 flex-1">
          Saat
          <input
            type="time"
            name="start_time"
            required
            defaultValue={initial?.start_time}
            className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        </label>
      </div>

      <div className="text-sm text-black/60">
        Süre
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreset(opt.value)}
              className={`text-xs py-2 rounded-lg border ${
                preset === opt.value
                  ? "bg-mia text-white border-mia"
                  : "border-black/10 text-black/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="duration_preset" value={preset} />
        {preset === "custom" && (
          <input
            type="number"
            name="duration_minutes"
            defaultValue={initial?.duration_minutes ?? 60}
            min={15}
            step={15}
            placeholder="Dakika"
            className="mt-2 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
          />
        )}
      </div>

      <label className="text-sm text-black/60">
        Durum
        <select
          name="status"
          defaultValue={initial?.status ?? "todo"}
          className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
        >
          <option value="todo">Bekliyor</option>
          <option value="in_progress">Devam ediyor</option>
          <option value="revision">Revize</option>
          <option value="done">Tamamlandı</option>
        </select>
      </label>

      {!initial && (
        <div className="flex gap-3">
          <label className="text-sm text-black/60 flex-1">
            Tekrarla
            <select
              name="repeat_frequency"
              value={repeatFrequency}
              onChange={(e) => setRepeatFrequency(e.target.value)}
              className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia bg-white"
            >
              <option value="none">Tekrarlanmasın</option>
              <option value="weekly">Haftada 1</option>
              <option value="monthly">Ayda 1</option>
            </select>
          </label>
          {repeatFrequency !== "none" && (
            <label className="text-sm text-black/60 flex-1">
              Kaç kez
              <input
                type="number"
                name="repeat_count"
                defaultValue={repeatFrequency === "weekly" ? 4 : 3}
                min={1}
                max={52}
                className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
              />
            </label>
          )}
        </div>
      )}

      {initial && (
        <div className="text-sm text-black/60">
          <div className="flex items-center justify-between mb-1.5">
            <span>Bağlı dosyalar</span>
            <DrivePickerButton onPicked={handleFilePicked} />
          </div>
          <div className="flex flex-col gap-1">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 bg-black/[0.03] rounded-lg px-2.5 py-2 text-xs"
              >
                <IconBrandGoogleDrive size={14} className="text-mia shrink-0" />
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate hover:underline"
                >
                  {f.file_name}
                </a>
                <button
                  type="button"
                  onClick={() => handleFileRemove(f.id)}
                  className="text-black/30 hover:text-red-500 shrink-0"
                >
                  <IconX size={13} />
                </button>
              </div>
            ))}
            {!files.length && <div className="text-xs text-black/30">Henüz dosya bağlanmadı.</div>}
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
          {pending ? "Kaydediliyor…" : initial ? "Kaydet" : "Görev ekle"}
        </button>
      </div>
    </form>
  );
}
