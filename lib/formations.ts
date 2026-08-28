export type FormationSlot = {
  id: string;
  x: number; // 0-100, left -> right
  y: number; // 0-100, top (attack) -> bottom (own goal)
};

export type Formation = {
  name: string;
  slots: FormationSlot[];
};

// y: 8 = forward line, 92 = goalkeeper
export const FORMATIONS: Formation[] = [
  {
    name: "4-3-3",
    slots: [
      { id: "gk", x: 50, y: 92 },
      { id: "lb", x: 15, y: 74 },
      { id: "lcb", x: 37, y: 78 },
      { id: "rcb", x: 63, y: 78 },
      { id: "rb", x: 85, y: 74 },
      { id: "lcm", x: 30, y: 52 },
      { id: "cm", x: 50, y: 58 },
      { id: "rcm", x: 70, y: 52 },
      { id: "lw", x: 18, y: 24 },
      { id: "st", x: 50, y: 14 },
      { id: "rw", x: 82, y: 24 },
    ],
  },
  {
    name: "4-4-2",
    slots: [
      { id: "gk", x: 50, y: 92 },
      { id: "lb", x: 15, y: 74 },
      { id: "lcb", x: 37, y: 78 },
      { id: "rcb", x: 63, y: 78 },
      { id: "rb", x: 85, y: 74 },
      { id: "lm", x: 15, y: 48 },
      { id: "lcm", x: 40, y: 52 },
      { id: "rcm", x: 60, y: 52 },
      { id: "rm", x: 85, y: 48 },
      { id: "lst", x: 38, y: 16 },
      { id: "rst", x: 62, y: 16 },
    ],
  },
  {
    name: "4-2-3-1",
    slots: [
      { id: "gk", x: 50, y: 92 },
      { id: "lb", x: 15, y: 74 },
      { id: "lcb", x: 37, y: 78 },
      { id: "rcb", x: 63, y: 78 },
      { id: "rb", x: 85, y: 74 },
      { id: "ldm", x: 35, y: 60 },
      { id: "rdm", x: 65, y: 60 },
      { id: "lam", x: 18, y: 34 },
      { id: "cam", x: 50, y: 32 },
      { id: "ram", x: 82, y: 34 },
      { id: "st", x: 50, y: 12 },
    ],
  },
  {
    name: "3-5-2",
    slots: [
      { id: "gk", x: 50, y: 92 },
      { id: "lcb", x: 25, y: 78 },
      { id: "cb", x: 50, y: 80 },
      { id: "rcb", x: 75, y: 78 },
      { id: "lwb", x: 10, y: 54 },
      { id: "lcm", x: 35, y: 50 },
      { id: "cm", x: 50, y: 56 },
      { id: "rcm", x: 65, y: 50 },
      { id: "rwb", x: 90, y: 54 },
      { id: "lst", x: 38, y: 16 },
      { id: "rst", x: 62, y: 16 },
    ],
  },
  {
    name: "4-5-1",
    slots: [
      { id: "gk", x: 50, y: 92 },
      { id: "lb", x: 15, y: 74 },
      { id: "lcb", x: 37, y: 78 },
      { id: "rcb", x: 63, y: 78 },
      { id: "rb", x: 85, y: 74 },
      { id: "lm", x: 12, y: 46 },
      { id: "lcm", x: 34, y: 54 },
      { id: "cm", x: 50, y: 50 },
      { id: "rcm", x: 66, y: 54 },
      { id: "rm", x: 88, y: 46 },
      { id: "st", x: 50, y: 14 },
    ],
  },
];

export const DEFAULT_FORMATION = FORMATIONS[0].name;

export function getFormation(name: string): Formation {
  return FORMATIONS.find((f) => f.name === name) ?? FORMATIONS[0];
}
