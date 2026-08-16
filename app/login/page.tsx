"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError("Bir şeyler yanlış gitti, tekrar dene.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7FA]">
      <div className="w-full max-w-sm bg-white border border-black/5 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 rounded-md bg-mia" />
          <span className="font-display font-medium text-lg">Mia Digital</span>
        </div>

        {sent ? (
          <div className="text-sm text-black/70">
            <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik. Gelen kutunu
            kontrol et.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm text-black/60">
              Ajans e-posta adresin
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad@miadigital.com"
                className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
              />
            </label>
            {error && <div className="text-xs text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="bg-mia text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
