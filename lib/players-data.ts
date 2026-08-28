import type { Player } from "./types";

function cap(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

const SQUAD_IDS = [
  "abdu",
  "arda",
  "baris",
  "batrakov",
  "berat",
  "canarmando",
  "cukubuku",
  "davinson",
  "eren",
  "eyup",
  "gunay",
  "ilkay",
  "jakobs",
  "jankat",
  "kaan",
  "kazımcan",
  "leao",
  "lemina",
  "nelsson",
  "nhaga",
  "osimhen",
  "sallai",
  "sane",
  "sara",
  "singo",
  "torrik",
  "ugurcan",
  "yunus",
];

const PROSPECT_IDS = ["alvarez", "pape-sarr", "van-dijk", "deniz", "ponomarenko", "yusuf"];

export const INITIAL_SQUAD: Player[] = SQUAD_IDS.map((id) => ({
  id,
  name: cap(id),
  img: `/players/${id}.png`,
}));

export const PROSPECTS: Player[] = PROSPECT_IDS.map((id) => ({
  id,
  name: cap(id).replace("-", " "),
  img: `/prospects/${id}.png`,
}));

export const ALL_PLAYERS: Record<string, Player> = Object.fromEntries(
  [...INITIAL_SQUAD, ...PROSPECTS].map((p) => [p.id, p])
);
