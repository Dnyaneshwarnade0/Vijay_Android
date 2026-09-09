import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import type { AppRole, Profile } from "@/lib/session";

export const PLAN_AMOUNT: Partial<Record<AppRole, number>> = {
  artist: 599,
  kathakar: 799,
};

/**
 * Payment QR + license key screen.
 * Admin Telegram se one-time license key deta hai; redeem hote hi key dobara use nahi ho sakti.
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
  const razorpayUrl =
    role === "artist"
      ? "https://razorpay.me/@vijayappasahebbodkhe?amount=QmsUqSRscbBFbActEhLNwg%3D%3D"
      : "https://razorpay.me/@vijayappasahebbodkhe?amount=ouka7pPo%2Fz198lsjyH%2BoeQ%3D%3D";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const entered = licenseKey.trim();
    if (entered.length < 4) {
      toast.error("Kripya poori License Key enter karein.");
      return;
    }
    setBusy(true);
    try {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token;
      if (!accessToken) throw new Error("Kripya sign in karke dobara try karein.");
      const { data, error } = await supabase.functions.invoke("license-redeem", {
        body: { key: entered },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      await qc.invalidateQueries({ queryKey: ["me", profile.id] });
      toast.success("License activate ho gayi! Yeh key ab use ho chuki hai.");
      onUnlocked();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "License verify nahi hui.");
    } finally {
      setBusy(false);
    }
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

            <img
              src={
                role === "artist"
                  ? "https://darkred-squid-510856.hostingersite.com/wp-content/uploads/2026/09/Artist-599Rs.png"
                  : "https://darkred-squid-510856.hostingersite.com/wp-content/uploads/2026/09/Kathakar-799Rs.png"
              }
              alt={`₹${amount} payment QR code`}
              className="mx-auto mt-4 h-72 w-72 rounded-2xl border-2 border-gold/40 bg-white object-contain p-1"
            />

            <button
              type="button"
              onClick={() => {
                window.location.href = razorpayUrl;
              }}
              className="bg-hero mt-4 flex w-full cursor-pointer items-center justify-center rounded-2xl py-3 text-sm font-bold text-warm shadow-[0_10px_22px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95"
            >
              Pay ₹{amount} securely
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-ink2">
              Payment verify hone ke baad admin se one-time License Key lein. Valid key enter karte hi account activate hoga.
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
