export type Player = {
  id: string;
  name: string;
  img: string;
};

export type TransactionType = "sat" | "kirala";

export type Transaction = {
  id: string;
  playerId: string;
  playerName: string;
  playerImg: string;
  type: TransactionType;
  amount: number;
  createdAt: number;
};

export type SlotAssignment = Record<string, string | null>;
