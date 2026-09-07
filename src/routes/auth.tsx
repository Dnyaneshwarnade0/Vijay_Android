import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  Phone,
  HelpCircle,
  LogIn,
  ChevronLeft,
  ArrowRight,
  Check,
  Music,
  Users,
  Piano,
  Drum,
  Disc,
  Guitar,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneFrame, CATEGORIES, type Category } from "@/components/PhoneFrame";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import logoUrl from "@/assets/swar-vijay-logo.jpg";
import { notifyAdminOfSignup } from "@/lib/telegram.functions";
import type { AppRole } from "@/lib/session";

/** 6 alag-alag boxes — non-technical user ke liye OTP bharna asaan. */
function OtpBoxes({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
}) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      {...(onComplete ? { onComplete } : {})}
      containerClassName="justify-center gap-2"
      aria-label="6 digit OTP code"
    >
      <InputOTPGroup className="gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className="h-14 w-11 rounded-xl border border-gold bg-surf3 text-xl font-bold text-maroon shadow-none first:rounded-xl last:rounded-xl"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

type Mode = "login" | "signup" | "forgot" | "verify" | "confirmed";

function errMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err)
    return String((err as { message: unknown }).message);
  return null;
}

// Strict Input Validations
function isValidEmail(emailStr: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(emailStr.trim());
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username.trim());
}

function usernameToInternalEmail(username: string): string {
  return `${username.trim().toLowerCase()}@users.swarvijay.local`;
}

function isValidPhone(phoneStr: string): boolean {
  const cleanPhone = phoneStr.replace(/[\s\-\+\(\)]/g, "");
  const phoneRegex = /^(?:91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
}

function isValidName(nameStr: string): boolean {
  return nameStr.trim().length >= 3 && /^[a-zA-Z\s\.\'\-]+$/.test(nameStr.trim());
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search["mode"] === "signup" ? "signup" : "login") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Swar Vijay Music Academy" },
      {
        name: "description",
        content:
          "Sign in or create your Swar Vijay account as an Artist, Kathakar or Admin.",
      },
    ],
  }),
  component: AuthPage,
});

const roles: { value: AppRole; label: string; mr: string; hint: string; icon: React.ElementType }[] = [
  { value: "student", label: "Student", mr: "विद्यार्थी", hint: "Sangeet seekhein", icon: GraduationCap },
  { value: "artist", label: "Artist", mr: "कलाकार", hint: "Apni khaali dates select karein", icon: Music },
  { value: "kathakar", label: "Kathakar", mr: "कथाकार", hint: "Available artist dhundein", icon: Users },
];

const categoryIcons: Record<string, React.ElementType> = {
  Keyboard: Piano,
  Tabla: Drum,
  Octapad: Disc,
  Banjo: Guitar,
};

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const notify = useServerFn(notifyAdminOfSignup);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole>("student");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [cooldown, setCooldown] = useState(0);

  // Resend button ka 45 second cooldown — user bar-bar dabakar block na ho jaye.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const loginIdentifier = email.trim().toLowerCase();
    const loginEmail = isValidEmail(loginIdentifier)
      ? loginIdentifier
      : isValidUsername(loginIdentifier)
        ? usernameToInternalEmail(loginIdentifier)
        : null;

    if (!loginEmail) {
      toast.error("Kripya valid username enter karein.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password me kam se kam 6 characters hone chahiye.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (error) throw new Error(error.message);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("login error", err);
      toast.error(errMessage(err) ?? "Login failed. Credentials check karein.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isValidName(fullName)) {
      toast.error("Full Name me kam se kam 3 letters hone chahiye.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Kripya sahi Email Address enter karein (e.g. rahul@gmail.com)");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Kripya 10-digit ka valid Indian Mobile Number enter karein.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password me kam se kam 6 characters hone chahiye.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms and one-device policy.");
      return;
    }

    setBusy(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role,
            category: role === "artist" ? category : null,
          },
        },
      });

      if (error) {
        // User already registered AND confirmed → tell them to login
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already registered")
        ) {
          toast.error("Ye Email pehle se registered aur confirmed hai. Login karein ya Forgot Password use karein.");
          setViewMode("login");
          return;
        }
        throw new Error(error.message);
      }

      // Empty identities = user exists but email NOT yet confirmed → resend OTP
      if (signUpData.user?.identities?.length === 0) {
        await supabase.auth.resend({ type: "signup", email: email.trim() });
        toast.info("Aapka account pehle se hai lekin confirm nahi hua. Naya OTP aapke email par bhej diya gaya.");
        setViewMode("verify");
        setBusy(false);
        return;
      }

      toast.success("Account ban gaya! Aapke Email par 6-digit OTP Code bhej diya gaya hai.");
      setViewMode("verify");
    } catch (err) {
      console.error("signup error", err);
      toast.error(errMessage(err) ?? "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendOtp() {
    if (!isValidEmail(email)) {
      toast.error("Email address valid nahi hai.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
      if (error) throw new Error(error.message);
      toast.success("Naya OTP Code aapke Email par bhej diya gaya!");
      setOtpCode("");
    } catch (err) {
      toast.error(errMessage(err) ?? "OTP resend fail ho gaya.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      toast.error("Kripya pura OTP Code enter karein (6 ya 8 digits)");
      return;
    }
    setBusy(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.trim();

    try {
      let verifyResult = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      if (verifyResult.error) {
        // Fallback to type: "email" if signup type returns error
        verifyResult = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "email",
        });
      }

      if (verifyResult.error) {
        throw new Error(verifyResult.error.message);
      }

      const verifiedUserId = verifyResult.data?.user?.id;

      // ONLY AFTER EMAIL OTP VERIFIED -> Send request to Admin via Telegram!
      try {
        await notify({
          data: verifiedUserId ? { userId: verifiedUserId, email: cleanEmail } : { email: cleanEmail },
        });
      } catch (e) {
        console.error("telegram notify failed", e);
      }

      toast.success("Email Verified!");
      setViewMode("confirmed");
    } catch (err) {
      console.error("verify otp error", err);
      toast.error(errMessage(err) ?? "Galat ya Expired OTP Code. 'Dobara bhejein' par click karein.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Kripya sahi Registered Email enter karein");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth?mode=login",
      });
      if (error) throw new Error(error.message);

      toast.success("Password Reset Code aapke Email par bhej diya gaya hai!");
      setForgotStep(2);
    } catch (err) {
      console.error("reset password error", err);
      toast.error(errMessage(err) ?? "Password reset request fail ho gayi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPasswordWithOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      toast.error("Kripya pura OTP code enter karein (6 ya 8 digits)");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Naye password me minimum 6 characters hone chahiye");
      return;
    }
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = otpCode.trim();

      let verifyErr = (await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "recovery",
      })).error;

      if (verifyErr) {
        verifyErr = (await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "email",
        })).error;
      }

      if (verifyErr) throw new Error(verifyErr.message);

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw new Error(updateErr.message);

      toast.success("Password badal gaya hai! Ab naye password se Login karein.");
      setViewMode("login");
    } catch (err) {
      console.error("update password error", err);
      toast.error(errMessage(err) ?? "Password update fail ho gaya");
    } finally {
      setBusy(false);
    }
  }

  const isArtist = role === "artist";
  const maxSteps = isArtist ? 4 : 3;
  const displayStep = isArtist ? signupStep : signupStep >= 3 ? signupStep - 1 : signupStep;

  const renderStepper = () => {
    return (
      <div className="mb-5 flex gap-1.5">
        {Array.from({ length: maxSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${displayStep >= i + 1 ? "bg-maroon" : "bg-[#EADCCB]"}`}
          />
        ))}
      </div>
    );
  };

  function goBackStep() {
    if (signupStep === 3 && !isArtist) setSignupStep(1);
    else setSignupStep((prev) => prev - 1);
  }

  function goToDetailsStep() {
    if (!isValidName(fullName)) {
      toast.error("Full Name me kam se kam 3 letters hone chahiye.");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Kripya 10-digit ka valid Indian Mobile Number enter karein.");
      return;
    }
    setSignupStep(4);
  }

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-1 flex-col justify-between bg-surface px-6 pb-8 pt-6">
        {viewMode === "login" && (
          <div>
            <img
              src={logoUrl}
              alt="Swar Vijay Music Academy logo"
              className="mb-4 h-18 w-18 object-contain"
            />
            <h1 className="font-display font-black text-2xl text-ink">Welcome back</h1>
            <p className="mb-6 mt-1 text-sm text-ink2">Sign in to continue your riyaz.</p>

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email */}
              <div>
                <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-white px-4 ${
                  email && !isValidEmail(email) && !isValidUsername(email) ? "border-red-500 ring-2 ring-red-100" : "border-border"
                }`}>
                  <Mail className="h-5 w-5 shrink-0 text-ink3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                  />
                </div>
                {email && !isValidEmail(email) && !isValidUsername(email) && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> Username mein 3–30 letters, numbers ya underscore use karein
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex h-14 items-center gap-3 rounded-2xl border border-maroon bg-white px-4 focus-within:ring-4 focus-within:ring-maroon/10">
                <Lock className="h-5 w-5 shrink-0 text-ink3" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-ink3 hover:text-ink cursor-pointer"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Forgot Password Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setViewMode("forgot");
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-maroon hover:underline bg-surf3 px-3 py-1.5 rounded-xl border border-gold/30 cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-maroon" /> Forgot password? (Reset via OTP)
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="bg-hero flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Login
              </button>
            </form>

            {/* Simple help — non-technical users ke liye */}
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-bord2 bg-surf3 p-3.5">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
              <div className="text-xs leading-relaxed text-ink2">
                <span className="font-bold text-maroon">Madad chahiye?</span> Password bhool gaye to upar
                “Forgot password” dabayein. Naya user hain to niche “Create an account” dabayein.
              </div>
            </div>
          </div>
        )}

        {viewMode === "forgot" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              type="button"
              onClick={() => setViewMode("login")}
              className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink transition hover:bg-surf2 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="font-display text-3xl font-black text-ink mb-1">Reset Password</h2>
            <p className="mb-6 text-sm text-ink2">
              {forgotStep === 1
                ? "Apna registered email daalein password reset OTP bhejane ke liye."
                : "Aapke email par aaya 6-digit OTP aur naya password enter karein."}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-white px-4 ${
                    email && !isValidEmail(email) ? "border-red-500 ring-2 ring-red-100" : "border-border"
                  }`}>
                    <Mail className="h-5 w-5 shrink-0 text-ink3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Registered Email Address"
                      className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="bg-hero mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
                  Send Reset OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink2">
                    Email par aaya 6-digit code
                  </p>
                  <OtpBoxes value={otpCode} onChange={setOtpCode} />
                </div>

                <div className="flex h-14 items-center gap-3 rounded-2xl border border-maroon bg-white px-4 focus-within:ring-4 focus-within:ring-maroon/10">
                  <Lock className="h-5 w-5 shrink-0 text-ink3" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Naya Password (8+ akshar, ek capital + number)"
                    className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-ink3 hover:text-ink cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="bg-hero mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Update Password
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpCode("");
                    setForgotStep(1);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 pt-2 text-xs font-semibold text-ink3 hover:text-maroon cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Code nahi mila? Dobara bhejein
                </button>
              </form>
            )}
          </div>
        )}

        {viewMode === "verify" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              type="button"
              onClick={() => setViewMode("signup")}
              className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink transition hover:bg-surf2 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="font-display text-3xl font-black text-ink mb-1">Email confirm karein</h2>
            <p className="mb-6 text-sm text-ink2">
              Humne <span className="font-bold text-maroon">{email}</span> par 6-digit code bheja hai.
              Wahi code niche bharein. (Inbox me na mile to Spam folder dekhein.)
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <OtpBoxes value={otpCode} onChange={setOtpCode} />

              <button
                type="submit"
                disabled={busy || otpCode.length < 6}
                className="bg-hero mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                {busy ? "Check kar rahe hain…" : "Email verify karein"}
              </button>

              <button
                type="button"
                disabled={busy || cooldown > 0}
                onClick={() => {
                  setCooldown(45);
                  handleResendOtp();
                }}
                className="flex w-full items-center justify-center gap-1.5 pt-3 text-sm font-semibold text-ink3 hover:text-maroon cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                {cooldown > 0 ? `Dobara bhejein (${cooldown}s)` : "Code nahi aaya? Dobara bhejein"}
              </button>
            </form>
          </div>
        )}

        {viewMode === "confirmed" && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green2/15 border-2 border-green2">
              <CheckCircle2 className="h-12 w-12 text-green2" />
            </div>
            <h2 className="font-display text-3xl font-black text-maroon mb-2">Account Confirmed!</h2>
            <p className="mb-8 text-sm text-ink2 max-w-xs">
              Aapka email verify ho gaya hai. Ab payment karke admin se mili License Key enter karein.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="bg-hero flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 cursor-pointer"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {viewMode === "signup" && (
          <div>
            {/* Common Header for all Steps */}
            <div className="mb-4 flex items-center gap-3">
              {signupStep === 1 ? (
                <button
                  onClick={() => setViewMode("login")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink transition hover:bg-surf2 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={goBackStep}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink transition hover:bg-surf2 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <h4 className="font-display text-sm font-bold text-ink3 tracking-widest uppercase">
                STEP {displayStep} OF {maxSteps}
              </h4>
            </div>

            {renderStepper()}

            {signupStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-display text-3xl font-black text-ink mb-1">Aap kaun hain?</h2>
                <p className="mb-6 text-sm text-ink2">Apna role select karein.</p>

                <div className="space-y-3">
                  {roles.map((r) => {
                    const isSelected = role === r.value;
                    const Icon = r.icon;
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-gold bg-surf3 shadow-md-sv"
                            : "border-border bg-white hover:border-gold/50"
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-goldgrad text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-maroon text-lg">{r.label}</span>
                            <span className="mr text-sm text-ink2">({r.mr})</span>
                          </div>
                          <span className="mt-0.5 block text-xs text-ink3">{r.hint}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (role === "admin") {
                      toast.info("Admin ke liye seedha login hai.");
                      setViewMode("login");
                      return;
                    }
                    if (role === "artist") setSignupStep(2);
                    else setSignupStep(3);
                  }}
                  className="bg-hero mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 cursor-pointer"
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {signupStep === 2 && role === "artist" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-display text-3xl font-black text-ink mb-1">Aapki category?</h2>
                <p className="mb-6 text-sm text-ink2">Ek option select karein.</p>

                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c;
                    const Icon = categoryIcons[c] || Music;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition cursor-pointer ${
                          isSelected
                            ? "border-gold bg-surf3 shadow-md-sv text-maroon"
                            : "border-border bg-white text-ink hover:border-gold/50"
                        }`}
                      >
                        <Icon className={`h-8 w-8 ${isSelected ? "text-maroon" : "text-ink3"}`} />
                        <span className="font-bold text-base">{c}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSignupStep(3)}
                  className="bg-hero mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 cursor-pointer"
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {signupStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-display text-3xl font-black text-ink mb-1">Your details</h2>
                <p className="mb-6 text-sm text-ink2">Apna naam aur mobile number bharein.</p>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-white px-4 ${
                      fullName && !isValidName(fullName) ? "border-red-500 ring-2 ring-red-100" : "border-border"
                    }`}>
                      <UserRound className="h-5 w-5 shrink-0 text-ink3" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter Full Name"
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                      />
                    </div>
                    {fullName && !isValidName(fullName) && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Full Name me minimum 3 letters hone chahiye
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-white px-4 ${
                      phone && !isValidPhone(phone) ? "border-red-500 ring-2 ring-red-100" : "border-border"
                    }`}>
                      <Phone className="h-5 w-5 shrink-0 text-ink3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter Phone Number"
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                      />
                    </div>
                    {phone && !isValidPhone(phone) && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Sahi 10-digit Mobile Number enter karein
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToDetailsStep}
                  className="bg-hero mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 cursor-pointer"
                >
                  Save & Continue <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {signupStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-display text-3xl font-black text-ink mb-1">Account banayein</h2>
                <p className="mb-6 text-sm text-ink2">Email aur password set karein.</p>

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Email */}
                  <div>
                    <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-white px-4 ${
                      email && !isValidEmail(email) ? "border-red-500 ring-2 ring-red-100" : "border-border"
                    }`}>
                      <Mail className="h-5 w-5 shrink-0 text-ink3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                      />
                    </div>
                    {email && !isValidEmail(email) && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Sahi Email enter karein (e.g. name@domain.com)
                      </p>
                    )}
                  </div>


                  {/* Password */}
                  <div>
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-maroon bg-white px-4 focus-within:ring-4 focus-within:ring-maroon/10">
                      <Lock className="h-5 w-5 shrink-0 text-ink3" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink3"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="text-ink3 hover:text-ink cursor-pointer"
                      >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1.5 px-1">
                      <div
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= 4 ? "bg-green2" : "bg-[#EADCCB]"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= 8 ? "bg-green2" : "bg-[#EADCCB]"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all ${
                          /[0-9]/.test(password) ? "bg-green2" : "bg-[#EADCCB]"
                        }`}
                      />
                    </div>
                    <p className="mt-1.5 px-1 text-xs text-ink3">
                      Mazboot password rakhein: kam se kam 8 akshar, ek capital letter aur ek number.
                    </p>
                  </div>

                  {/* Terms & Consent — poori row clickable hai */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={agreeTerms}
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="flex w-full items-start gap-3 py-2 text-left cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        agreeTerms
                          ? "bg-maroon border-maroon text-white shadow-sm"
                          : "border-border bg-white text-transparent"
                      }`}
                    >
                      <Check className={`h-3.5 w-3.5 stroke-[3] ${agreeTerms ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    <span className="text-xs leading-relaxed text-ink2 select-none">
                      Main <span className="font-bold text-maroon">Terms</span> aur{" "}
                      <span className="font-bold text-maroon">one-device policy</span> se sehmat hoon.
                    </span>
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-hero mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm shadow-[0_12px_26px_-12px_rgba(123,30,53,0.85)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  >
                    {busy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Footer Toggle */}
        <div className="pt-4 text-center text-sm text-ink2">
          {viewMode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setSignupStep(1);
                  setViewMode("signup");
                }}
                className="font-bold text-maroon hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setViewMode("login")}
                className="font-bold text-maroon hover:underline cursor-pointer"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
