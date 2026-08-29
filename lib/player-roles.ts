// Canonical position tag per player, matching formation slot-id vocabulary
// (gk, lb, rb, lcb, rcb, cb, ldm, rdm, dm, lcm, rcm, cm, lm, rm, lw, rw, lam, ram, cam, st ...)
export const PLAYER_ROLES: Record<string, string> = {
  ugurcan: "gk",
  jankat: "gk",
  gunay: "gk",

  sallai: "rb",
  singo: "rb",
  eren: "lb",
  kazımcan: "lb",

  abdu: "lcb",
  arda: "rcb",
  davinson: "rcb",
  nelsson: "rcb",

  torrik: "ldm",
  lemina: "rdm",
  kaan: "dm",
  cukubuku: "dm",

  sara: "lcm",
  batrakov: "rcm",
  ilkay: "cm",
  nhaga: "cm",
  canarmando: "cm",

  sane: "rw",
  baris: "rw",
  berat: "rw",

  leao: "lw",
  yunus: "lw",

  osimhen: "st",
};

// Players with no known position yet — surfaced so it's easy to fill in later.
export const UNPOSITIONED_PLAYERS = ["eyup", "jakobs"];

export const PROSPECT_ROLES: Record<string, string> = {
  alvarez: "rw",
  "van-dijk": "rcb",
  yusuf: "rcb",
  ponomarenko: "st",
  deniz: "st",
  "pape-sarr": "dm",
};

export const ROLE_LABELS: Record<string, string> = {
  gk: "Kaleci",
  rb: "Sağ Bek",
  lb: "Sol Bek",
  lcb: "Sol Stoper",
  rcb: "Sağ Stoper",
  cb: "Stoper",
  ldm: "Defansif Orta Saha (Sol)",
  rdm: "Defansif Orta Saha (Sağ)",
  dm: "Defansif Orta Saha",
  lcm: "Orta Saha (Sol)",
  rcm: "Orta Saha (Sağ)",
  cm: "Orta Saha",
  lm: "Sol Orta Saha",
  rm: "Sağ Orta Saha",
  lw: "Sol Açık",
  rw: "Sağ Açık",
  lam: "Sol Ofansif Orta Saha",
  ram: "Sağ Ofansif Orta Saha",
  cam: "Ofansif Orta Saha",
  st: "Santrafor",
};

// Ordered fallback chain: if a player's exact role slot doesn't exist in the
// active formation, try the next best match.
const ROLE_SLOT_CANDIDATES: Record<string, string[]> = {
  gk: ["gk"],
  rb: ["rb", "rwb"],
  lb: ["lb", "lwb"],
  lcb: ["lcb", "cb"],
  rcb: ["rcb", "cb"],
  cb: ["cb", "lcb", "rcb"],
  ldm: ["ldm", "dm", "lcm"],
  rdm: ["rdm", "dm", "rcm"],
  dm: ["dm", "ldm", "rdm", "cm"],
  lcm: ["lcm", "cm", "lm"],
  rcm: ["rcm", "cm", "rm"],
  cm: ["cm", "lcm", "rcm", "dm"],
  lm: ["lm", "lw", "lcm"],
  rm: ["rm", "rw", "rcm"],
  lw: ["lw", "lm", "lam"],
  rw: ["rw", "rm", "ram"],
  lam: ["lam", "cam", "lw"],
  ram: ["ram", "cam", "rw"],
  cam: ["cam", "lam", "ram"],
  st: ["st", "lst", "rst", "cf", "cam"],
  cf: ["cf", "st"],
  lst: ["lst", "st"],
  rst: ["rst", "st"],
};

export function findSlotForRole(role: string | undefined, slotIds: string[]): string | null {
  if (!role) return null;
  const candidates = ROLE_SLOT_CANDIDATES[role] ?? [role];
  for (const candidate of candidates) {
    if (slotIds.includes(candidate)) return candidate;
  }
  return null;
}
