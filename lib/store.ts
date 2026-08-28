import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_SQUAD, PROSPECTS } from "./players-data";
import { DEFAULT_FORMATION, getFormation } from "./formations";
import type { SlotAssignment, Transaction, TransactionType } from "./types";

const BENCH_LIMIT = 7;

type Destination =
  | { type: "slot"; slotId: string }
  | { type: "bench" }
  | { type: "reserve" };

type Location =
  | { where: "slot"; slotId: string }
  | { where: "bench"; index: number }
  | { where: "reserve"; index: number }
  | { where: "prospects"; index: number }
  | { where: "none" };

type GalaState = {
  formation: string;
  starters: SlotAssignment;
  bench: string[];
  reserve: string[];
  prospects: string[];
  transactions: Transaction[];
  formationHistory: Record<string, SlotAssignment>;

  setFormation: (name: string) => void;
  movePlayer: (playerId: string, dest: Destination) => void;
  addProspectToSquad: (playerId: string) => void;
  sellPlayer: (playerId: string, amount: number) => void;
  loanPlayer: (playerId: string, amount: number) => void;
  firePlayer: (playerId: string) => void;
  undoTransaction: (transactionId: string) => void;
  locate: (playerId: string) => Location;
};

function buildInitialStarters(): SlotAssignment {
  const slots = getFormation(DEFAULT_FORMATION).slots;
  const starters: SlotAssignment = {};
  slots.forEach((slot, i) => {
    starters[slot.id] = INITIAL_SQUAD[i]?.id ?? null;
  });
  return starters;
}

function buildInitialBenchReserve() {
  const slots = getFormation(DEFAULT_FORMATION).slots;
  const rest = INITIAL_SQUAD.slice(slots.length).map((p) => p.id);
  const bench = rest.slice(0, BENCH_LIMIT);
  const reserve = rest.slice(BENCH_LIMIT);
  return { bench, reserve };
}

function locateIn(
  playerId: string,
  starters: SlotAssignment,
  bench: string[],
  reserve: string[],
  prospects: string[]
): Location {
  for (const slotId of Object.keys(starters)) {
    if (starters[slotId] === playerId) return { where: "slot", slotId };
  }
  const bi = bench.indexOf(playerId);
  if (bi !== -1) return { where: "bench", index: bi };
  const ri = reserve.indexOf(playerId);
  if (ri !== -1) return { where: "reserve", index: ri };
  const pi = prospects.indexOf(playerId);
  if (pi !== -1) return { where: "prospects", index: pi };
  return { where: "none" };
}

function removeFromLocation(
  loc: Location,
  starters: SlotAssignment,
  bench: string[],
  reserve: string[],
  prospects: string[]
) {
  if (loc.where === "slot") starters[loc.slotId] = null;
  if (loc.where === "bench") bench.splice(loc.index, 1);
  if (loc.where === "reserve") reserve.splice(loc.index, 1);
  if (loc.where === "prospects") prospects.splice(loc.index, 1);
}

export const useGalaStore = create<GalaState>()(
  persist(
    (set, get) => {
      const { bench, reserve } = buildInitialBenchReserve();
      return {
        formation: DEFAULT_FORMATION,
        starters: buildInitialStarters(),
        bench,
        reserve,
        prospects: PROSPECTS.map((p) => p.id),
        transactions: [],
        formationHistory: {},

        locate: (playerId) => {
          const s = get();
          return locateIn(playerId, s.starters, s.bench, s.reserve, s.prospects);
        },

        setFormation: (name) => {
          const state = get();
          if (name === state.formation) return;
          const oldFormation = getFormation(state.formation);
          const newFormation = getFormation(name);

          const history = { ...state.formationHistory, [state.formation]: { ...state.starters } };

          const squadPool = new Set([
            ...Object.values(state.starters).filter(Boolean),
            ...state.bench,
            ...state.reserve,
          ] as string[]);

          const cachedTarget = history[name];
          const cachedValid =
            cachedTarget &&
            Object.values(cachedTarget).every((pid) => !pid || squadPool.has(pid));

          let newStarters: SlotAssignment;

          if (cachedValid) {
            newStarters = { ...cachedTarget };
          } else {
            newStarters = {};
            newFormation.slots.forEach((slot) => (newStarters[slot.id] = null));

            const currentPlayers = oldFormation.slots
              .map((slot) => ({ slot, playerId: state.starters[slot.id] }))
              .filter((e): e is { slot: typeof oldFormation.slots[number]; playerId: string } => !!e.playerId);

            const availableSlots = [...newFormation.slots];
            for (const entry of currentPlayers) {
              if (availableSlots.length === 0) break;
              let bestIdx = 0;
              let bestDist = Infinity;
              availableSlots.forEach((slot, idx) => {
                const dist = (slot.x - entry.slot.x) ** 2 + (slot.y - entry.slot.y) ** 2;
                if (dist < bestDist) {
                  bestDist = dist;
                  bestIdx = idx;
                }
              });
              const chosen = availableSlots.splice(bestIdx, 1)[0];
              newStarters[chosen.id] = entry.playerId;
            }
          }

          set({ formation: name, starters: newStarters, formationHistory: history });
        },

        movePlayer: (playerId, dest) => {
          const state = get();
          const starters = { ...state.starters };
          const bench = [...state.bench];
          const reserve = [...state.reserve];
          const prospects = [...state.prospects];

          const loc = locateIn(playerId, starters, bench, reserve, prospects);
          if (loc.where === "none") return;

          removeFromLocation(loc, starters, bench, reserve, prospects);

          if (dest.type === "slot") {
            const occupant = starters[dest.slotId];
            if (occupant && occupant !== playerId) {
              if (loc.where === "slot") {
                starters[loc.slotId] = occupant;
              } else if (bench.length < BENCH_LIMIT) {
                bench.push(occupant);
              } else {
                reserve.push(occupant);
              }
            }
            starters[dest.slotId] = playerId;
          } else if (dest.type === "bench") {
            if (bench.length < BENCH_LIMIT) {
              bench.push(playerId);
            } else {
              reserve.push(playerId);
            }
          } else {
            reserve.push(playerId);
          }

          set({ starters, bench, reserve, prospects });
        },

        addProspectToSquad: (playerId) => {
          const state = get();
          const prospects = state.prospects.filter((id) => id !== playerId);
          const reserve = [...state.reserve, playerId];
          set({ prospects, reserve });
        },

        sellPlayer: (playerId, amount) => {
          releasePlayer(get, set, playerId, "sat", amount);
        },

        loanPlayer: (playerId, amount) => {
          releasePlayer(get, set, playerId, "kirala", amount);
        },

        firePlayer: (playerId) => {
          const state = get();
          const starters = { ...state.starters };
          const bench = [...state.bench];
          const reserve = [...state.reserve];
          const prospects = [...state.prospects];
          const loc = locateIn(playerId, starters, bench, reserve, prospects);
          if (loc.where === "none") return;
          removeFromLocation(loc, starters, bench, reserve, prospects);
          set({ starters, bench, reserve, prospects });
        },

        undoTransaction: (transactionId) => {
          const state = get();
          const tx = state.transactions.find((t) => t.id === transactionId);
          if (!tx) return;
          const transactions = state.transactions.filter((t) => t.id !== transactionId);
          const reserve = [...state.reserve, tx.playerId];
          set({ transactions, reserve });
        },
      };
    },
    { name: "gala11-store" }
  )
);

function releasePlayer(
  get: () => GalaState,
  set: (partial: Partial<GalaState>) => void,
  playerId: string,
  type: TransactionType,
  amount: number
) {
  const state = get();
  const starters = { ...state.starters };
  const bench = [...state.bench];
  const reserve = [...state.reserve];
  const prospects = [...state.prospects];
  const loc = locateIn(playerId, starters, bench, reserve, prospects);
  if (loc.where === "none") return;
  removeFromLocation(loc, starters, bench, reserve, prospects);

  const player = INITIAL_SQUAD.find((p) => p.id === playerId) ?? PROSPECTS.find((p) => p.id === playerId);
  const transaction: Transaction = {
    id: `${playerId}-${Date.now()}`,
    playerId,
    playerName: player?.name ?? playerId,
    playerImg: player?.img ?? "",
    type,
    amount,
    createdAt: Date.now(),
  };

  set({
    starters,
    bench,
    reserve,
    prospects,
    transactions: [transaction, ...state.transactions],
  });
}
