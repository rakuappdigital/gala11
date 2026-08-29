export const AUTO_FORMATION_NAME = "Otomatik";

// slotId -> playerId, matches the "Otomatik" formation defined in formations.ts
export const AUTO_STARTERS: Record<string, string> = {
  gk: "ugurcan",
  rb: "sallai",
  lcb: "abdu",
  rcb: "davinson",
  ldm: "torrik",
  rdm: "lemina",
  lcm: "sara",
  rcm: "batrakov",
  rw: "sane",
  lw: "leao",
  st: "osimhen",
};

export const AUTO_BENCH: string[] = ["jankat", "gunay", "baris", "yunus", "canarmando", "arda", "berat"];

export const PROSPECT_ROLES: Record<string, string> = {
  alvarez: "Sağ Açık (İleri)",
  "van-dijk": "Sağ Stoper",
  yusuf: "Yedek Sağ Stoper",
  ponomarenko: "Yedek Santrafor",
  deniz: "Yedek Santrafor",
};
