import { createFileRoute } from "@tanstack/react-router";

/**
 * Retired: the active Telegram webhook is the secured Supabase Edge Function.
 * Keeping this route locked prevents a public request from changing bot behaviour.
 */
export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: { handlers: { POST: async () => Response.json({ ok: false, reason: "retired" }, { status: 410 }) } },
});
