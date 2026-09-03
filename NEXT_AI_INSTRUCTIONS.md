# Swar Vijay — Next AI Tool Instructions (current state, Sep 2026)

## Stack
TanStack Start (React 19 + Vite 7) · Tailwind v4 (`src/styles.css` tokens) · Supabase (Lovable Cloud)
Server logic = `createServerFn` (`src/lib/*.functions.ts`) · Public HTTP = `src/routes/api/public/*`

## What already works
- Signup (3 steps: role → category → details) with 6-digit **email OTP** confirmation.
- **Forgot password** = email OTP + new password (`viewMode="forgot"`, 2 steps).
- **Telegram approval**: OTP verify hote hi admin ko bot par Approve/Reject buttons jaate hain
  (`src/lib/telegram.server.ts`, `src/routes/api/public/telegram/webhook.ts`, secret `TELEGRAM_BOT_TOKEN`).
- Gate screen har 4 sec me approval poll karta hai; approve hote hi dashboard khul jaata hai.
- Roles: `artist` (calendar), `kathakar` (free-artist search + bot), `admin` (approvals + telegram settings).

## Removed on purpose — DO NOT re-add
- Fake "Continue with Google" button (koi OAuth provider configured nahi tha).
- "Invisible bot-check / captcha" note (kuch bhi verify nahi karta tha).
- **Admin license key backdoor** (`SWAR-VIJAY-ADMIN-2026` etc.) signup aur gate screen dono se.
  Ye client-side privilege escalation tha. Admin banane ke liye `user_roles` row DB me insert karein.
- Unused shadcn components (sirf `ui/sonner.tsx` aur `ui/input-otp.tsx` bache hain).
- Artist calendar ka dead "back" button.

## UX rules followed (inhe todna mat)
- Saara user-facing text simple Hinglish me; har screen par ek short help line.
- OTP hamesha 6 alag boxes (`OtpBoxes` in `src/routes/auth.tsx`), resend par 45s cooldown.
- Har dashboard header me "?" help button (`src/components/AppShell.tsx`, `HELP_STEPS` role-wise).
- Logout par confirm dialog.

## Known limitation
Supabase weak-password check on hai: password 8+ chars, capital + number chahiye.
Email delivery ke liye custom sender domain verified hona zaroori hai (Cloud → Emails).

## Good next tasks
1. Booking flow: kathakar artist ki free date par booking bheje → artist accept/reject.
2. Admin ke liye user list me search/filter + pagination.
3. Telegram par booking notification (approval jaisa hi pattern reuse karein).
4. Push/WhatsApp reminders, aur artist profile photo upload (Supabase storage bucket).
