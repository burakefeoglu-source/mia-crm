"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const DAY_LABELS = ["P", "S", "Ç", "P", "C", "C", "P"];
const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function MiniCalendar({ markedDates }: { markedDates: string[] }) {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Pazartesi başlangıç
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">
          {MONTH_LABELS[month]} {year}
        </span>
        <div className="flex gap-1 text-black/40">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <IconChevronLeft size={13} />
          </button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <IconChevronRight size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[9px] text-black/40 text-center mb-1">
        {DAY_LABELS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = fmt(d);
          const isToday = dateStr === today;
          const isMarked = markedDates.includes(dateStr);
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-[10px] rounded ${
                isToday
                  ? "bg-mia text-white font-medium"
                  : isMarked
                  ? "bg-mia-light text-mia"
                  : "text-black/60"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
