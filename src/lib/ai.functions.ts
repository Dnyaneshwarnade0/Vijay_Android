import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export interface AskInput {
  message: string;
  role: "admin" | "kathakar";
  context: string;
  today: string;
}

const SUPABASE_AUTH_URL = "https://bbbbsnplgxkyjsubvxar.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QGU1kSGInxk3GnwwkGUFLA_UsamTNA5";

function systemPrompt(role: "admin" | "kathakar", today: string, context: string) {
  return [
    "You are 'AI Sahayak', the assistant inside the Swar Vijay Music Academy app.",
    "Understand Marathi, Hindi and English. ALWAYS reply in the same language the user wrote in (Marathi -> Marathi, Hindi/Hinglish -> Hinglish, English -> English).",
    "Be short: max 6 short lines or bullets. No markdown headings.",
    `Today's date: ${today}.`,
    role === "admin"
      ? "User is an ADMIN: help with license keys, users, artists, courses and Telegram."
      : "User is a KATHAKAR (program organiser): help with finding artists, booking and planning.",
    "Artist availability data below is the only source of truth about who is free. If it is empty, say no free artist was found for that date/category and ask for another date.",
    "Never invent artists, phone numbers or dates.",
    "--- DATA ---",
    context || "(no artist data for this question)",
  ].join("\n");
}

export const askSahayak = createServerFn({ method: "POST" })
  .inputValidator((input: AskInput) => {
    if (!input?.message?.trim()) throw new Error("Sawaal khaali hai.");
    return {
      message: input.message.trim().slice(0, 1200),
      role: input.role === "admin" ? ("admin" as const) : ("kathakar" as const),
      context: (input.context ?? "").slice(0, 4000),
      today: input.today,
    };
  })
  .handler(async ({ data }) => {
    const authHeader = getRequestHeader("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) throw new Error("Login required");

    const userRes = await fetch(`${SUPABASE_AUTH_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) throw new Error("Login required");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI abhi configure nahi hai.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning_effort: "low",
        max_completion_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt(data.role, data.today, data.context) },
          { role: "user", content: data.message },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 402) throw new Error("AI credits khatam ho gaye hain. Lovable me credits add karein.");
      if (res.status === 429) throw new Error("Thoda ruk kar dobara try karein (limit).");
      throw new Error("AI abhi jawab nahi de paa raha. Thodi der baad try karein.");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("AI se jawab nahi mila.");
    return { reply };
  });
