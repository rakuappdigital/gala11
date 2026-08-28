"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { transactionDirection } from "@/lib/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n) + " €";
}

const TYPE_LABELS: Record<Transaction["type"], string> = {
  sat: "Satış",
  kirala: "Kiralık",
  "satin-al": "Transfer",
};

export default function KasaPanel({
  transactions,
  onUndo,
}: {
  transactions: Transaction[];
  onUndo: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  const gelir = transactions
    .filter((t) => transactionDirection(t.type) === "gelir")
    .reduce((sum, t) => sum + t.amount, 0);
  const gider = transactions
    .filter((t) => transactionDirection(t.type) === "gider")
    .reduce((sum, t) => sum + t.amount, 0);
  const net = gelir - gider;

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white/90">Kasa</h3>
        <span className={`text-sm font-bold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
          {formatMoney(net)}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1.5">
          <div className="text-green-400/70">Gelir</div>
          <div className="text-green-400 font-semibold">{formatMoney(gelir)}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
          <div className="text-red-400/70">Gider</div>
          <div className="text-red-400 font-semibold">{formatMoney(gider)}</div>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-xs text-white/30 italic">Henüz işlem yok</p>
          ) : (
            transactions.map((t) => {
              const isGider = transactionDirection(t.type) === "gider";
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5"
                >
                  <div>
                    <span className="font-semibold text-white">{t.playerName}</span>
                    <span className="text-white/50 ml-1">({TYPE_LABELS[t.type]})</span>
                    <div className={isGider ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
                      {isGider ? "-" : "+"}
                      {formatMoney(t.amount)}
                    </div>
                  </div>
                  <button
                    onClick={() => onUndo(t.id)}
                    className="text-[10px] px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white"
                  >
                    Geri Al
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
