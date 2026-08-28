export type Player = {
  id: string;
  name: string;
  img: string;
};

export type TransactionType = "sat" | "kirala" | "satin-al";

export type Transaction = {
  id: string;
  playerId: string;
  playerName: string;
  playerImg: string;
  type: TransactionType;
  amount: number;
  createdAt: number;
};

export function transactionDirection(type: TransactionType): "gelir" | "gider" {
  return type === "satin-al" ? "gider" : "gelir";
}

export type SlotAssignment = Record<string, string | null>;
