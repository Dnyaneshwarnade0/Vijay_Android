import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, QrCode, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import type { AppRole, Profile } from "@/lib/session";

export const PLAN_AMOUNT: Partial<Record<AppRole, number>> = {
  artist: 599,
  kathakar: 799,
};

export function licenseUnlockKey(userId: string) {
  return `sv_license_ok_${userId}`;
}

export function isLicenseUnlocked(userId: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(licenseUnlockKey(userId)) === "1";
  } catch {
    return false;
  }
}

/**
 * Payment QR + license key screen.
 * Admin payment manually verify karke license key deta hai; key sahi hone par hi app khulta hai.
 */
export function LicenseGate({
  profile,
  role,
  onUnlocked,
}: {
  profile: Profile;
  role: AppRole;
  onUnlocked: () => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [licenseKey, setLicenseKey] = useState("");
  const [busy, setBusy] = useState(false);
  const amount = PLAN_AMOUNT[role] ?? 599;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const entered = licenseKey.trim();
    if (entered.length < 4) {
      toast.error("Kripya poori License Key enter karein.");
      return;
    }
    setBusy(true);
    const stored = (profile.license_key ?? "").trim();
    if (!stored) {
      setBusy(false);
      toast.error("Admin ne abhi tak aapki payment approve karke License Key nahi di hai. Thodi der baad koshish karein.");
      return;
    }
    if (stored.toLowerCase() !== entered.toLowerCase()) {
      setBusy(false);
      toast.error("License Key galat hai. Admin se mili key dobara check karein.");
      return;
    }
    try {
      window.localStorage.setItem(licenseUnlockKey(profile.id), "1");
    } catch {}
    setBusy(false);
    toast.success("License activate ho gayi! App khul raha hai…");
    onUnlocked();
  }

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-1 flex-col bg-surface px-6 pb-8 pt-8">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-4 h-14 w-14 rounded-2xl border border-gold" />
          <h1 className="font-display text-2xl font-black text-maroon">Payment & License</h1>
          <p className="mt-1 text-sm text-ink2">
            {role === "artist" ? "Artist" : "Kathakar"} plan — niche diye QR se payment karein.
          </p>

          <div className="mt-5 w-full rounded-3xl border border-gold/40 bg-surf3 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-ink3">Amount</div>
            <div className="font-display text-4xl font-black text-maroon">₹{amount}</div>

            <div className="mx-auto mt-4 flex h-52 w-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-maroon/30 bg-white text-ink3">
              <QrCode className="h-14 w-14 text-maroon/40" />
              <span className="px-6 text-[11px] leading-snug">
                Payment QR yahan lagegi (₹{amount})
              </span>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-ink2">
              Payment ke baad admin manually verify karega aur aapko License Key bhejega.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-maroon bg-white px-4 focus-within:ring-4 focus-within:ring-maroon/10">
            <KeyRound className="h-5 w-5 shrink-0 text-ink3" />
            <input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter License Key"
              className="w-full bg-transparent text-base tracking-wider text-ink outline-none placeholder:text-ink3"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-hero flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            Unlock App
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-2xl border border-maroon/40 bg-white py-3 text-sm font-bold text-maroon transition hover:bg-surf2 cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
}
