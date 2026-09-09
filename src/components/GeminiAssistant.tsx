import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { askSahayak } from "@/lib/ai.functions";
import { findFreeArtists, parseFreeQuery, rangeLabel } from "@/lib/free-artists";
import { toISODate } from "@/lib/calendar";


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

let uid = 0;

function getFunctionErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Kuch galat ho gaya. Dobara koshish karein.";

  const context = (error as Error & { context?: unknown }).context;
  if (!(context instanceof Response)) return error.message;

  return context
    .clone()
    .json()
    .then((body: unknown) => {
      const message =
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof (body as { error?: unknown }).error === "string"
          ? (body as { error: string }).error
          : error.message;
      return message;
    })
    .catch(() => error.message);
}

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
      const msg = await getFunctionErrorMessage(e);
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
      const msg = await getFunctionErrorMessage(e);
      if (msg === "Login required") {
        await supabase.auth.signOut({ scope: "local" });
        toast.error("Aapka login session expire ho gaya tha. Kripya dobara login karein.");
        window.location.assign("/auth?mode=login");
        return;
      }
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
