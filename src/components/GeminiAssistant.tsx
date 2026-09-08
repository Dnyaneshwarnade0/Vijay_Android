import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX_LEN = 1200;

interface Msg {
  id: number;
  from: "ai" | "me";
  text: string;
}

const WELCOME: Record<"admin" | "kathakar", string> = {
  admin:
    "नमस्कार Admin! Main aapka AI Sahayak hoon. License keys, users, artists, courses, Telegram ya app ke kisi bhi kaam me madad ke liye sawaal poochhiye.",
  kathakar:
    "नमस्कार! Main aapka AI Sahayak hoon. Programs, artist booking, planning ya kirtan-related sawaal Hindi ya Hinglish me poochh sakte hain.",
};

const STARTERS: Record<"admin" | "kathakar", string[]> = {
  admin: [
    "Naye user ka license key kaise generate karun?",
    "Users aur artists ko manage karne ka tarika kya hai?",
    "Courses aur Telegram bot kaise use hote hain?",
  ],
  kathakar: [
    "Kirtan program ki planning kaise karun?",
    "Artist ko booking ke liye kya-kya batana chahiye?",
    "Ek achhe kirtan ki rup-rekha bataiye",
  ],
};

let uid = 0;

export function GeminiAssistant({ role }: { role: "admin" | "kathakar" }) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid++, from: "ai", text: WELCOME[role] },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function connectTelegramAi() {
    setLinkLoading(true);
    setLinkError(null);
    try {
      const { data: sessionData } = await supabase.auth.refreshSession();
      const token =
        sessionData.session?.access_token ??
        (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error("Aapka session expire ho gaya hai. Dobara login karein.");

      const { data, error } = await supabase.functions.invoke("telegram-ai-link", {
        body: {},
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;

      const url = (data as { link?: string; url?: string } | null)?.link ??
        (data as { url?: string } | null)?.url;
      if (!url || typeof url !== "string") throw new Error("Telegram link nahi mila. Thodi der baad try karein.");

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Telegram connect fail ho gaya. Dobara koshish karein.";
      setLinkError(msg);
      toast.error(msg);
    } finally {
      setLinkLoading(false);
    }
  }

  async function ask(text: string) {
    const q = text.trim().slice(0, MAX_LEN);
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: uid++, from: "me", text: q }]);
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.refreshSession();
      const token =
        sessionData.session?.access_token ??
        (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error("Aapka session expire ho gaya hai. Dobara login karein.");

      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: { message: q },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;

      const reply =
        (data as { reply?: string; message?: string; text?: string } | null)?.reply ??
        (data as { message?: string } | null)?.message ??
        (data as { text?: string } | null)?.text;
      if (!reply) throw new Error("AI se jawab nahi mila. Thodi der baad try karein.");

      setMessages((m) => [...m, { id: uid++, from: "ai", text: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kuch galat ho gaya. Dobara koshish karein.";
      toast.error(msg);
      setMessages((m) => [...m, { id: uid++, from: "ai", text: `⚠️ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surf2 p-4">
        <span className="bg-goldgrad flex h-10 w-10 items-center justify-center rounded-xl text-deep">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg leading-tight text-maroon">AI Sahayak</p>
          <p className="text-xs text-ink3">
            {role === "admin" ? "Admin ke kaamo me madad" : "Kathakar ke liye salah"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/40 bg-surf3 p-3">
        <p className="text-xs font-semibold text-maroon">Telegram par bhi AI Sahayak use karein</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink3">Button dabayein, Telegram mein Start karein, phir `/ai` ke baad apna sawaal likhein.</p>
        <button
          type="button"
          onClick={connectTelegramAi}
          disabled={linkLoading}
          className="mt-2 w-full rounded-xl border border-maroon bg-white px-3 py-2 text-xs font-bold text-maroon disabled:opacity-60"
        >
          {linkLoading ? "Telegram link ban raha hai…" : "Connect Telegram AI"}
        </button>
        {linkError && <p className="mt-2 text-[11px] text-crimson">{linkError}</p>}
      </div>

      <div className="flex-1 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.from === "me" ? "bg-hero text-warm" : "border border-border bg-surface text-ink"
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                {m.from === "me" ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                {m.from === "me" ? "Aap" : "AI Sahayak"}
              </span>
              <p className="mt-1 whitespace-pre-line">{m.text}</p>
            </div>
          </div>
        ))}
        {busy && <p className="text-xs text-ink3">AI Sahayak soch raha hai…</p>}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STARTERS[role].map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={busy} className="chip-sv text-[11px]">
            {s}
          </button>
        ))}
      </div>

      <form
        className="sticky bottom-0 bg-background pb-1 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            maxLength={MAX_LEN}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Apna sawaal likhiye…"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-ink3 focus:border-gold"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Bhejein"
            className="bg-hero flex items-center justify-center rounded-xl px-4 text-warm disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-right text-[10px] text-ink3">
          {input.length}/{MAX_LEN}
        </p>
      </form>
    </div>
  );
}
