"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n) + " €";
}

export default function KasaPanel({
  transactions,
  onUndo,
}: {
  transactions: Transaction[];
  onUndo: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-sm font-bold text-white/90">Kasa</h3>
        <span className="text-sm font-bold text-green-400">{formatMoney(total)}</span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-xs text-white/30 italic">Henüz işlem yok</p>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5"
              >
                <div>
                  <span className="font-semibold text-white">{t.playerName}</span>
                  <span className="text-white/50 ml-1">
                    {t.type === "sat" ? "(satış)" : "(kiralık)"}
                  </span>
                  <div className="text-green-400 font-semibold">{formatMoney(t.amount)}</div>
                </div>
                <button
                  onClick={() => onUndo(t.id)}
                  className="text-[10px] px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white"
                >
                  Geri Al
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
