export type Player = {
  id: string;
  name: string;
  img: string;
};

export type TransactionType = "sat" | "kirala" | "satin-al" | "kirala-al" | "kov";

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
  return type === "satin-al" || type === "kirala-al" ? "gider" : "gelir";
}

export function isIncomingTransferType(type: TransactionType): boolean {
  return type === "satin-al" || type === "kirala-al";
}

export type SlotAssignment = Record<string, string | null>;
