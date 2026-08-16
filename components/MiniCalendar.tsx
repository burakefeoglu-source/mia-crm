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
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-black/70">
          {MONTH_LABELS[month]} {year}
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-5 h-5 flex items-center justify-center rounded-md text-black/35 hover:bg-black/5 hover:text-black/60"
          >
            <IconChevronLeft size={12} />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-5 h-5 flex items-center justify-center rounded-md text-black/35 hover:bg-black/5 hover:text-black/60"
          >
            <IconChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 w-full text-center mb-1.5">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-[9px] text-black/35 font-medium">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 w-full gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = fmt(d);
          const isToday = dateStr === today;
          const isMarked = markedDates.includes(dateStr);
          return (
            <div key={i} className="flex items-center justify-center">
              <div
                className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-full ${
                  isToday
                    ? "bg-mia text-white font-medium"
                    : isMarked
                    ? "bg-mia-light text-mia font-medium"
                    : "text-black/55"
                }`}
              >
                {d}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
