// Server-only license key helpers.
import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function block(len: number) {
  let out = "";
  for (let i = 0; i < len; i += 1) out += ALPHABET[randomInt(0, ALPHABET.length)];
  return out;
}

/** SV-ART-XXXX-XXXX jaisi readable license key. */
export function generateLicenseKey(role?: string | null) {
  const tag = role === "kathakar" ? "KTH" : role === "admin" ? "ADM" : "ART";
  return `SV-${tag}-${block(4)}-${block(4)}`;
}
