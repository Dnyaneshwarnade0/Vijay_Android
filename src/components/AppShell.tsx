import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HelpCircle, LogOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import type { AppRole, Profile } from "@/lib/session";
import { roleLabel } from "@/lib/session";

/** Har role ke liye seedhe-saade steps — non-technical user ke liye. */
const HELP_STEPS: Record<AppRole, string[]> = {
  artist: [
    "Calendar kholein aur jis din aap free hain us date par tap karein.",
    "Green date ka matlab: aap us din available hain.",
    "Dobara tap karke availability hata sakte hain.",
    "Admin aur Kathakar aapki free dates dekh kar booking bhejenge.",
  ],
  kathakar: [
    "“Free artists” tab me date chunein aur category select karein.",
    "List me jo artist dikhein, unka phone number tap karke call karein.",
    "“Bot” tab me sawaal poochh kar bhi free artist dhoondh sakte hain.",
  ],
  admin: [
    "Naye account approve ya reject karein — Telegram par bhi wahi buttons aate hain.",
    "Telegram settings me bot se /start karke apna chat link karein.",
    "“Free artists” me date-wise available artists dekh sakte hain.",
  ],
};

export function AppShell({
  profile,
  role,
  nav,
  children,
}: {
  profile: Profile;
  role: AppRole;
  nav?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [helpOpen, setHelpOpen] = useState(false);

  async function signOut() {
    if (!window.confirm("Kya aap sach me logout karna chahte hain?")) return;
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  return (
    <PhoneFrame>
      <header className="bg-darkgrad sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-warm">
                {profile.full_name || profile.email}
              </p>
              <p className="text-[11px] text-gold2">{roleLabel[role]}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setHelpOpen(true)}
              aria-label="Madad / Help"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/50 text-gold2"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/50 text-gold2"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 pb-6 pt-4">{children}</main>

      {nav}

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
          <div className="w-full max-w-sm rounded-t-3xl bg-surface p-5 shadow-xl sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-black text-maroon">App kaise use karein?</h2>
              <button
                onClick={() => setHelpOpen(false)}
                aria-label="Band karein"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-ink2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-2.5">
              {HELP_STEPS[role].map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-goldgrad text-xs font-bold text-deep">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setHelpOpen(false)}
              className="bg-hero mt-5 w-full rounded-2xl py-3 text-base font-bold text-warm"
            >
              Samajh gaya
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}

export function BottomNav({
  items,
  active,
  onChange,
}: {
  items: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <nav className="sticky bottom-0 border-t border-border bg-surface">
      <div className="flex">
        {items.map((it) => {
          const Icon = it.icon;
          const on = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold transition ${
                on ? "text-maroon" : "text-ink3"
              }`}
            >
              <Icon className={`h-5 w-5 ${on ? "text-maroon" : "text-ink3"}`} />
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-green/10 text-green border-green/30",
    pending: "bg-saffron/10 text-saffron border-saffron/30",
    rejected: "bg-crimson/10 text-crimson border-crimson/30",
    revoked: "bg-ink3/10 text-ink3 border-ink3/30",
    confirmed: "bg-green/10 text-green border-green/30",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
        styles[status] ?? "bg-surf3 text-ink2 border-border"
      }`}
    >
      {status}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="card-sv p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink3">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
