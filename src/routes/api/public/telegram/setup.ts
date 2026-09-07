import { createFileRoute } from "@tanstack/react-router";

/**
 * Retired: Telegram is handled only by the secured Supabase Edge Function.
 * This endpoint intentionally cannot change the bot webhook.
 */
export const Route = createFileRoute("/api/public/telegram/setup")({
  server: { handlers: { GET: async () => Response.json({ ok: false, reason: "retired" }, { status: 410 }) } },
});
