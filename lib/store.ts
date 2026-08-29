import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_SQUAD, PROSPECTS } from "./players-data";
import { DEFAULT_FORMATION, getFormation } from "./formations";
import { AUTO_BENCH, AUTO_FORMATION_NAME, AUTO_STARTERS } from "./auto-team";
import type { SlotAssignment, Transaction, TransactionType } from "./types";

const BENCH_LIMIT = 7;

export type BoardKey = "as" | "yedek";

type BoardState = {
  formation: string;
  starters: SlotAssignment;
  bench: string[];
  formationHistory: Record<string, SlotAssignment>;
};

type Destination =
  | { type: "slot"; slotId: string }
  | { type: "bench" }
  | { type: "reserve" };

type Location =
  | { where: "slot"; slotId: string }
  | { where: "bench"; index: number }
  | { where: "reserve" }
  | { where: "prospects"; index: number }
  | { where: "none" };

type GalaState = {
  squadIds: string[];
  prospects: string[];
  loanedIds: string[];
  boards: Record<BoardKey, BoardState>;
  activeBoard: BoardKey;
  resetSnapshots: Record<BoardKey, { starters: SlotAssignment; bench: string[] } | null>;
  transactions: Transaction[];

  setActiveBoard: (board: BoardKey) => void;
  setFormation: (name: string) => void;
  movePlayer: (playerId: string, dest: Destination) => void;
  buyProspect: (playerId: string, amount: number) => void;
  loanProspectIn: (playerId: string, amount: number) => void;
  sellPlayer: (playerId: string, amount: number) => void;
  loanPlayer: (playerId: string, amount: number) => void;
  firePlayer: (playerId: string) => void;
  undoTransaction: (transactionId: string) => void;
  resetStarters: () => void;
  undoReset: () => void;
  autoFillTeam: () => void;
  locate: (playerId: string) => Location;
};

function emptyBoard(formationName: string): BoardState {
  const starters: SlotAssignment = {};
  getFormation(formationName).slots.forEach((slot) => (starters[slot.id] = null));
  return { formation: formationName, starters, bench: [], formationHistory: {} };
}

function cloneBoard(board: BoardState): BoardState {
  return {
    formation: board.formation,
    starters: { ...board.starters },
    bench: [...board.bench],
    formationHistory: board.formationHistory,
  };
}

function locateInBoard(playerId: string, board: BoardState, squadIds: string[], prospects: string[]): Location {
  for (const slotId of Object.keys(board.starters)) {
    if (board.starters[slotId] === playerId) return { where: "slot", slotId };
  }
  const bi = board.bench.indexOf(playerId);
  if (bi !== -1) return { where: "bench", index: bi };
  if (squadIds.includes(playerId)) return { where: "reserve" };
  const pi = prospects.indexOf(playerId);
  if (pi !== -1) return { where: "prospects", index: pi };
  return { where: "none" };
}

function removeFromBoardLocation(loc: Location, board: BoardState, prospects: string[]) {
  if (loc.where === "slot") board.starters[loc.slotId] = null;
  if (loc.where === "bench") board.bench.splice(loc.index, 1);
  if (loc.where === "prospects") prospects.splice(loc.index, 1);
}

function removeFromEverywhere(boards: Record<BoardKey, BoardState>, squadIds: string[], playerId: string) {
  const nextBoards: Record<BoardKey, BoardState> = {
    as: cloneBoard(boards.as),
    yedek: cloneBoard(boards.yedek),
  };
  (Object.keys(nextBoards) as BoardKey[]).forEach((key) => {
    const b = nextBoards[key];
    Object.keys(b.starters).forEach((slotId) => {
      if (b.starters[slotId] === playerId) b.starters[slotId] = null;
    });
    b.bench = b.bench.filter((id) => id !== playerId);
  });
  return { boards: nextBoards, squadIds: squadIds.filter((id) => id !== playerId) };
}

export const useGalaStore = create<GalaState>()(
  persist(
    (set, get) => ({
      squadIds: INITIAL_SQUAD.map((p) => p.id),
      prospects: PROSPECTS.map((p) => p.id),
      loanedIds: [],
      boards: {
        as: emptyBoard(DEFAULT_FORMATION),
        yedek: emptyBoard(DEFAULT_FORMATION),
      },
      activeBoard: "as",
      resetSnapshots: { as: null, yedek: null },
      transactions: [],

      locate: (playerId) => {
        const s = get();
        return locateInBoard(playerId, s.boards[s.activeBoard], s.squadIds, s.prospects);
      },

      setActiveBoard: (board) => set({ activeBoard: board }),

      setFormation: (name) => {
        const state = get();
        const key = state.activeBoard;
        const current = state.boards[key];
        if (name === current.formation) return;

        const oldFormation = getFormation(current.formation);
        const newFormation = getFormation(name);
        const history = { ...current.formationHistory, [current.formation]: { ...current.starters } };

        const squadPool = new Set([
          ...Object.values(current.starters).filter(Boolean),
          ...current.bench,
        ] as string[]);

        const cachedTarget = history[name];
        const cachedValid =
          cachedTarget && Object.values(cachedTarget).every((pid) => !pid || squadPool.has(pid));

        let newStarters: SlotAssignment;

        if (cachedValid) {
          newStarters = { ...cachedTarget };
        } else {
          newStarters = {};
          newFormation.slots.forEach((slot) => (newStarters[slot.id] = null));

          const currentPlayers = oldFormation.slots
            .map((slot) => ({ slot, playerId: current.starters[slot.id] }))
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

        set({
          boards: {
            ...state.boards,
            [key]: { ...current, formation: name, starters: newStarters, formationHistory: history },
          },
        });
      },

      movePlayer: (playerId, dest) => {
        const state = get();
        const key = state.activeBoard;
        const board = cloneBoard(state.boards[key]);
        const prospects = [...state.prospects];

        const loc = locateInBoard(playerId, board, state.squadIds, prospects);
        if (loc.where === "none") return;

        removeFromBoardLocation(loc, board, prospects);

        if (dest.type === "slot") {
          const occupant = board.starters[dest.slotId];
          if (occupant && occupant !== playerId) {
            if (loc.where === "slot") {
              board.starters[loc.slotId] = occupant;
            } else if (board.bench.length < BENCH_LIMIT) {
              board.bench.push(occupant);
            }
          }
          board.starters[dest.slotId] = playerId;
        } else if (dest.type === "bench") {
          if (board.bench.length < BENCH_LIMIT) board.bench.push(playerId);
        }

        set({ boards: { ...state.boards, [key]: board }, prospects });
      },

      buyProspect: (playerId, amount) => {
        const state = get();
        const prospects = state.prospects.filter((id) => id !== playerId);
        const squadIds = [...state.squadIds, playerId];

        const player = INITIAL_SQUAD.find((p) => p.id === playerId) ?? PROSPECTS.find((p) => p.id === playerId);
        const transaction: Transaction = {
          id: `${playerId}-${Date.now()}`,
          playerId,
          playerName: player?.name ?? playerId,
          playerImg: player?.img ?? "",
          type: "satin-al",
          amount,
          createdAt: Date.now(),
        };

        set({ prospects, squadIds, transactions: [transaction, ...state.transactions] });
      },

      loanProspectIn: (playerId, amount) => {
        const state = get();
        const prospects = state.prospects.filter((id) => id !== playerId);
        const squadIds = [...state.squadIds, playerId];
        const loanedIds = [...state.loanedIds, playerId];

        const player = INITIAL_SQUAD.find((p) => p.id === playerId) ?? PROSPECTS.find((p) => p.id === playerId);
        const transaction: Transaction = {
          id: `${playerId}-${Date.now()}`,
          playerId,
          playerName: player?.name ?? playerId,
          playerImg: player?.img ?? "",
          type: "kirala-al",
          amount,
          createdAt: Date.now(),
        };

        set({ prospects, squadIds, loanedIds, transactions: [transaction, ...state.transactions] });
      },

      sellPlayer: (playerId, amount) => releasePlayer(get, set, playerId, "sat", amount),
      loanPlayer: (playerId, amount) => releasePlayer(get, set, playerId, "kirala", amount),
      firePlayer: (playerId) => releasePlayer(get, set, playerId, "kov", 0),

      resetStarters: () => {
        const state = get();
        const key = state.activeBoard;
        const board = state.boards[key];
        const displaced = Object.values(board.starters).filter((v): v is string => !!v);
        const bench = [...board.bench];
        for (const pid of displaced) {
          if (bench.length < BENCH_LIMIT) bench.push(pid);
        }
        const starters: SlotAssignment = {};
        Object.keys(board.starters).forEach((k) => (starters[k] = null));

        set({
          resetSnapshots: {
            ...state.resetSnapshots,
            [key]: { starters: board.starters, bench: board.bench },
          },
          boards: { ...state.boards, [key]: { ...board, starters, bench } },
        });
      },

      undoReset: () => {
        const state = get();
        const key = state.activeBoard;
        const snap = state.resetSnapshots[key];
        if (!snap) return;
        set({
          boards: { ...state.boards, [key]: { ...state.boards[key], starters: snap.starters, bench: snap.bench } },
          resetSnapshots: { ...state.resetSnapshots, [key]: null },
        });
      },

      autoFillTeam: () => {
        const state = get();
        const starters: SlotAssignment = {};
        getFormation(AUTO_FORMATION_NAME).slots.forEach((slot) => (starters[slot.id] = null));
        Object.entries(AUTO_STARTERS).forEach(([slotId, playerId]) => {
          starters[slotId] = playerId;
        });

        const boardAs: BoardState = {
          formation: AUTO_FORMATION_NAME,
          starters,
          bench: [...AUTO_BENCH],
          formationHistory: {
            ...state.boards.as.formationHistory,
            [AUTO_FORMATION_NAME]: { ...starters },
          },
        };

        set({ boards: { ...state.boards, as: boardAs }, activeBoard: "as" });
      },

      undoTransaction: (transactionId) => {
        const state = get();
        const tx = state.transactions.find((t) => t.id === transactionId);
        if (!tx) return;
        const transactions = state.transactions.filter((t) => t.id !== transactionId);
        const loanedIds = state.loanedIds.filter((id) => id !== tx.playerId);

        if (tx.type === "satin-al" || tx.type === "kirala-al") {
          const { boards, squadIds } = removeFromEverywhere(state.boards, state.squadIds, tx.playerId);
          const prospects = [...state.prospects, tx.playerId];
          set({ transactions, boards, squadIds, prospects, loanedIds });
        } else {
          const squadIds = [...state.squadIds, tx.playerId];
          set({ transactions, squadIds, loanedIds });
        }
      },
    }),
    { name: "gala11-store-v3" }
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
  const loc = locateInBoard(playerId, state.boards[state.activeBoard], state.squadIds, state.prospects);
  if (loc.where === "none") return;

  const { boards, squadIds } = removeFromEverywhere(state.boards, state.squadIds, playerId);
  const loanedIds = state.loanedIds.filter((id) => id !== playerId);

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

  // Firing a player voids the fee originally paid to bring them in.
  const transactions =
    type === "kov"
      ? state.transactions.map((t) =>
          t.playerId === playerId && (t.type === "satin-al" || t.type === "kirala-al") ? { ...t, amount: 0 } : t
        )
      : state.transactions;

  set({
    boards,
    squadIds,
    loanedIds,
    transactions: [transaction, ...transactions],
  });
}
