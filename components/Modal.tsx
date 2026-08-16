"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-[popIn_0.15s_ease-out]`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="font-display text-lg font-medium">{title}</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black/60">
            <IconX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
