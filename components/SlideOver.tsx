"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect } from "react";

export function SlideOver({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl overflow-y-auto animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 sticky top-0 bg-white z-10">
          <h2 className="font-display text-lg font-medium">{title}</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black/60">
            <IconX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
