import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { callTelegram, resolveBot } from "@/lib/telegram.server";
import { generateLicenseKey } from "@/lib/license.server";
import { findFreeArtists, formatFreeReplyHtml, parseFreeQuery } from "@/lib/free-artists";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  artist: "Artist",
  kathakar: "Kathakar",
  student: "Student",
};

const PLAN_AMOUNT: Record<string, number> = { artist: 599, kathakar: 799 };

const MAIN_MENU = {
  inline_keyboard: [
    [
      { text: "⏳ Pending approvals", callback_data: "menu:pending" },
      { text: "👥 All users", callback_data: "menu:users" },
    ],
    [
      { text: "🔑 License keys", callback_data: "menu:license" },
      { text: "🔍 Find artists", callback_data: "menu:find" },
    ],
    [
      { text: "📅 Free today", callback_data: "menu:freetoday" },
      { text: "📊 Stats", callback_data: "menu:stats" },
    ],
    [{ text: "❓ Help", callback_data: "menu:help" }],
  ],
};

const FIND_MENU = {
  inline_keyboard: [
    [
      { text: "Keyboard", callback_data: "find:Keyboard" },
      { text: "Tabla", callback_data: "find:Tabla" },
    ],
    [
      { text: "Octapad", callback_data: "find:Octapad" },
      { text: "Banjo", callback_data: "find:Banjo" },
    ],
    [{ text: "⬅️ Menu", callback_data: "menu:home" }],
  ],
};

const HELP_TEXT =
  "<b>Swar Vijay Admin Bot</b>\n\n" +
  "/menu — saare options ka menu\n" +
  "/pending — approval waale accounts\n" +
  "/users — sabhi users ki list\n" +
  "/license — license key generate / dekhein\n" +
  "/find — category chunkar free artists\n" +
  "/free 2026-09-01 2026-09-05 Tabla — dates ke hisaab se free artists\n" +
  "/free kal Harmonium\n" +
  "/stats — account summary\n" +
  "/help — ye message";

type Db = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function roleOf(db: Db, userId: string) {
  const { data } = await db.from("user_roles").select("role").eq("user_id", userId);
  return (data?.[0]?.role as string | undefined) ?? null;
}

async function sendMainMenu(token: string, chatId: string) {
  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text: "<b>Swar Vijay Admin Menu</b>\nKya karna hai?",
    reply_markup: MAIN_MENU,
  });
}

async function sendPending(db: Db, token: string, chatId: string) {
  const { data: rows } = await db
    .from("profiles")
    .select("id, full_name, email, category")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (!rows?.length) {
    await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: "✅ Koi pending account nahi hai.",
      reply_markup: MAIN_MENU,
    });
    return;
  }

  for (const r of rows) {
    const role = (await roleOf(db, r.id)) ?? "";
    await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        `⏳ <b>${ROLE_LABEL[role] ?? "User"}</b> ${r.full_name || r.email}\n` +
        `${r.email}${r.category ? `\nCategory: ${r.category}` : ""}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Approve", callback_data: `approve:${r.id}` },
            { text: "❌ Reject", callback_data: `reject:${r.id}` },
          ],
        ],
      },
    });
  }
}

async function sendUsers(db: Db, token: string, chatId: string) {
  const { data: rows } = await db
    .from("profiles")
    .select("id, full_name, email, status, category, phone")
    .order("created_at", { ascending: false })
    .limit(40);

  if (!rows?.length) {
    await callTelegram(token, "sendMessage", { chat_id: chatId, text: "Koi user nahi mila." });
    return;
  }

  const icon: Record<string, string> = {
    approved: "✅",
    pending: "⏳",
    rejected: "❌",
    revoked: "🚫",
  };
  const lines = rows.map(
    (r) =>
      `${icon[r.status] ?? "•"} <b>${r.full_name || r.email}</b>` +
      `${r.category ? ` — ${r.category}` : ""}${r.phone ? `\n   📞 ${r.phone}` : ""}`,
  );

  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text: `<b>Users (${rows.length})</b>\n\n${lines.join("\n")}`,
    reply_markup: MAIN_MENU,
  });
}

async function sendLicenseList(db: Db, token: string, chatId: string) {
  const { data: rows } = await db
    .from("profiles")
    .select("id, full_name, email, license_key, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);

  if (!rows?.length) {
    await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: "Koi approved user nahi hai jise license key di ja sake.",
      reply_markup: MAIN_MENU,
    });
    return;
  }

  const keyboard = rows.map((r) => [
    {
      text: `${r.license_key ? "🔑" : "➕"} ${r.full_name || r.email}`,
      callback_data: `lic:${r.id}`,
    },
  ]);
  keyboard.push([{ text: "⬅️ Menu", callback_data: "menu:home" }]);

  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text:
      "<b>🔑 License keys</b>\nUser par tap karein — key generate hogi (ya purani dikhegi).\n" +
      "🔑 = key already hai, ➕ = abhi tak nahi.",
    reply_markup: { inline_keyboard: keyboard },
  });
}

async function issueLicense(db: Db, token: string, chatId: string, userId: string, force: boolean) {
  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, email, license_key")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) {
    await callTelegram(token, "sendMessage", { chat_id: chatId, text: "User nahi mila." });
    return;
  }

  const role = (await roleOf(db, userId)) ?? "artist";
  let key = profile.license_key ?? null;
  if (!key || force) {
    key = generateLicenseKey(role);
    const { error } = await db
      .from("profiles")
      .update({ license_key: key, status: "approved", updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) {
      await callTelegram(token, "sendMessage", {
        chat_id: chatId,
        text: `Key save nahi hui: ${error.message}`,
      });
      return;
    }
  }

  const amount = PLAN_AMOUNT[role];
  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text:
      `🔑 <b>License Key</b>\n\n` +
      `${ROLE_LABEL[role] ?? "User"} — ${profile.full_name || profile.email}\n` +
      `${profile.email}\n` +
      (amount ? `Plan: ₹${amount}\n` : "") +
      `\n<code>${key}</code>\n\n` +
      `Ye key user ko bhej dein — app me daalte hi unlock ho jayega.`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "♻️ Nayi key banayein", callback_data: `licnew:${userId}` }],
        [{ text: "⬅️ Menu", callback_data: "menu:home" }],
      ],
    },
  });
}

async function sendStats(db: Db, token: string, chatId: string) {
  const { data: rows } = await db.from("profiles").select("status, license_key");
  const all = rows ?? [];
  const count = (s: string) => all.filter((r) => r.status === s).length;
  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text:
      "<b>📊 Stats</b>\n\n" +
      `Total accounts: <b>${all.length}</b>\n` +
      `✅ Approved: ${count("approved")}\n` +
      `⏳ Pending: ${count("pending")}\n` +
      `❌ Rejected: ${count("rejected")}\n` +
      `🔑 License issued: ${all.filter((r) => r.license_key).length}`,
    reply_markup: MAIN_MENU,
  });
}

async function sendFreeQuery(db: Db, token: string, chatId: string, raw: string) {
  const q = parseFreeQuery(raw);
  try {
    const artists = await findFreeArtists(db, q);
    await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text: formatFreeReplyHtml(q, artists),
      reply_markup: MAIN_MENU,
    });
  } catch (e) {
    await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: e instanceof Error ? e.message : "Search fail ho gaya. /help bhejein.",
    });
  }
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bot = await resolveBot();
        if (!bot) {
          return new Response("Not configured", { status: 404 });
        }
        const header = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(header, bot.secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const token = bot.token;
        const adminChatId = bot.adminChatId;
        const update = (await request.json()) as {
          message?: { chat?: { id?: number }; text?: string };
          callback_query?: {
            id: string;
            data?: string;
            message?: { chat?: { id?: number }; message_id?: number; text?: string };
          };
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as Db;

        // 1) Messages
        const msg = update.message;
        if (msg?.chat?.id) {
          const chatId = String(msg.chat.id);
          const text = (msg.text ?? "").trim();

          if (text.startsWith("/start")) {
            await db
              .from("telegram_settings")
              .upsert(
                { id: "default", admin_chat_id: chatId, updated_at: new Date().toISOString() },
                { onConflict: "id" },
              );
            await callTelegram(token, "sendMessage", {
              chat_id: chatId,
              parse_mode: "HTML",
              text:
                "✅ <b>Swar Vijay Admin Chat linked!</b>\n\n" +
                "Naya signup hote hi yahan Approve / Reject ka message aayega.",
            });
            await sendMainMenu(token, chatId);
            return Response.json({ ok: true });
          }

          if (adminChatId !== chatId) return Response.json({ ok: true, ignored: true });

          if (text.startsWith("/menu")) await sendMainMenu(token, chatId);
          else if (text.startsWith("/help"))
            await callTelegram(token, "sendMessage", {
              chat_id: chatId,
              parse_mode: "HTML",
              text: HELP_TEXT,
              reply_markup: MAIN_MENU,
            });
          else if (text.startsWith("/pending")) await sendPending(db, token, chatId);
          else if (text.startsWith("/users")) await sendUsers(db, token, chatId);
          else if (text.startsWith("/license") || text.startsWith("/key"))
            await sendLicenseList(db, token, chatId);
          else if (text.startsWith("/stats")) await sendStats(db, token, chatId);
          else if (text.startsWith("/find"))
            await callTelegram(token, "sendMessage", {
              chat_id: chatId,
              text: "🔍 Category chunein:",
              reply_markup: FIND_MENU,
            });
          else if (text.startsWith("/free"))
            await sendFreeQuery(db, token, chatId, text.replace("/free", " "));
          else if (text && !text.startsWith("/")) await sendFreeQuery(db, token, chatId, text);
          else
            await callTelegram(token, "sendMessage", {
              chat_id: chatId,
              parse_mode: "HTML",
              text: HELP_TEXT,
              reply_markup: MAIN_MENU,
            });

          return Response.json({ ok: true });
        }

        // 2) Buttons
        const cq = update.callback_query;
        if (cq?.data) {
          const chatId = cq.message?.chat?.id ? String(cq.message.chat.id) : null;
          if (!chatId || chatId !== adminChatId) {
            await callTelegram(token, "answerCallbackQuery", {
              callback_query_id: cq.id,
              text: "Sirf admin ye kar sakta hai.",
            });
            return Response.json({ ok: true });
          }

          const [action, arg] = cq.data.split(":");
          await callTelegram(token, "answerCallbackQuery", { callback_query_id: cq.id });

          if (action === "menu") {
            if (arg === "home") await sendMainMenu(token, chatId);
            else if (arg === "pending") await sendPending(db, token, chatId);
            else if (arg === "users") await sendUsers(db, token, chatId);
            else if (arg === "license") await sendLicenseList(db, token, chatId);
            else if (arg === "stats") await sendStats(db, token, chatId);
            else if (arg === "freetoday") await sendFreeQuery(db, token, chatId, "aaj");
            else if (arg === "find")
              await callTelegram(token, "sendMessage", {
                chat_id: chatId,
                text: "🔍 Category chunein:",
                reply_markup: FIND_MENU,
              });
            else
              await callTelegram(token, "sendMessage", {
                chat_id: chatId,
                parse_mode: "HTML",
                text: HELP_TEXT,
                reply_markup: MAIN_MENU,
              });
            return Response.json({ ok: true });
          }

          if (action === "find" && arg) {
            await sendFreeQuery(db, token, chatId, `aaj ${arg}`);
            return Response.json({ ok: true });
          }

          if ((action === "lic" || action === "licnew") && arg) {
            await issueLicense(db, token, chatId, arg, action === "licnew");
            return Response.json({ ok: true });
          }

          if ((action === "approve" || action === "reject") && arg) {
            const status = action === "approve" ? "approved" : "rejected";
            const { data: updated, error } = await db
              .from("profiles")
              .update({ status, updated_at: new Date().toISOString() })
              .eq("id", arg)
              .select("full_name, email, category")
              .maybeSingle();

            if (error || !updated) {
              await callTelegram(token, "sendMessage", {
                chat_id: chatId,
                text: "Update fail ho gaya.",
              });
              return Response.json({ ok: true });
            }

            const role = ROLE_LABEL[(await roleOf(db, arg)) ?? ""] ?? "User";
            if (cq.message?.message_id) {
              await callTelegram(token, "editMessageText", {
                chat_id: chatId,
                message_id: cq.message.message_id,
                parse_mode: "HTML",
                text:
                  `${status === "approved" ? "✅" : "❌"} <b>${role}</b> ${updated.full_name || updated.email}` +
                  `\n${updated.email}\n\nStatus: <b>${status}</b>`,
                reply_markup:
                  status === "approved"
                    ? {
                        inline_keyboard: [
                          [{ text: "🔑 License key banayein", callback_data: `lic:${arg}` }],
                        ],
                      }
                    : undefined,
              });
            }
          }
          return Response.json({ ok: true });
        }

        return Response.json({ ok: true, ignored: true });
      },
    },
  },
});
