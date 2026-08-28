"use client";

import { useState, useRef, useEffect } from "react";
import { IconSend2, IconAlertTriangle, IconClockExclamation, IconScale, IconSparkles } from "@tabler/icons-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantClient({
  overdueTasks,
  understaffedShoots,
  workload,
}: {
  overdueTasks: any[];
  understaffedShoots: any[];
  workload: { list: { id: string; name: string; count: number }[]; imbalanced: { name: string }[] };
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Merhaba! Ben Mia CRM'in AI proje yöneticisiyim. Görevler, çekimler ve ekip iş yükü hakkında soru sorabilirsin — örneğin \"Bu hafta kim en yoğun?\" ya da \"Hangi görevler gecikti?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Bir hata oluştu." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Bağlantı hatası, tekrar dener misin?" }]);
    } finally {
      setLoading(false);
    }
  };

  const maxWorkload = Math.max(...workload.list.map((m) => m.count), 1);

  return (
    <div className="flex gap-6 h-[calc(100vh-64px)]">
      <div className="w-[300px] shrink-0 flex flex-col gap-4">
        <div>
          <h1 className="font-display text-xl font-medium mb-1">AI Asistan</h1>
          <p className="text-sm text-black/50">Proje sağlığı ve risk özeti.</p>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconClockExclamation size={16} className="text-red-500" />
            <span className="text-sm font-medium">Geciken görevler</span>
            <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {overdueTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {overdueTasks.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => send(`"${t.title}" görevi neden gecikti, ne yapmalıyım?`)}
                className="text-left text-xs bg-red-50/50 hover:bg-red-50 rounded-lg px-2.5 py-2 transition-colors"
              >
                <div className="font-medium text-black/80 truncate">{t.title}</div>
                <div className="text-black/40">{t.task_date}</div>
              </button>
            ))}
            {!overdueTasks.length && <div className="text-xs text-black/30">Gecikmiş görev yok 🎉</div>}
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconAlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-medium">Eksik detaylı çekimler</span>
            <span className="ml-auto text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {understaffedShoots.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {understaffedShoots.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => send(`"${s.title || "İsimsiz çekim"}" çekiminde eksik olan ne, tamamlamam için ne yapmalıyım?`)}
                className="text-left text-xs bg-amber-50/50 hover:bg-amber-50 rounded-lg px-2.5 py-2 transition-colors"
              >
                <div className="font-medium text-black/80 truncate">{s.title || "İsimsiz çekim"}</div>
                <div className="text-black/40">{s.shoot_date}</div>
              </button>
            ))}
            {!understaffedShoots.length && <div className="text-xs text-black/30">Hepsi tam 🎉</div>}
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconScale size={16} className="text-mia" />
            <span className="text-sm font-medium">Ekip iş yükü</span>
          </div>
          <div className="flex flex-col gap-2">
            {workload.list.map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={workload.imbalanced.some((i) => i.name === m.name) ? "font-medium text-red-500" : "text-black/60"}>
                    {m.name}
                  </span>
                  <span className="text-black/40">{m.count}</span>
                </div>
                <div className="h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      workload.imbalanced.some((i) => i.name === m.name) ? "bg-red-400" : "bg-mia"
                    }`}
                    style={{ width: `${(m.count / maxWorkload) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col bg-white border border-black/5 rounded-2xl overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-mia text-white"
                    : "bg-black/[0.04] text-black/80"
                }`}
              >
                {m.role === "assistant" && (
                  <IconSparkles size={13} className="inline mr-1.5 -mt-0.5 text-mia" />
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-black/[0.04] rounded-2xl px-4 py-2.5 text-sm text-black/40">
                Düşünüyor…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-black/5 p-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Bir şey sor…"
            className="flex-1 border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-mia"
          />
          <button
            onClick={() => send()}
            disabled={loading}
            className="bg-mia text-white rounded-xl px-4 flex items-center justify-center disabled:opacity-50"
          >
            <IconSend2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
