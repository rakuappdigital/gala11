"use client";

import type { Transaction } from "@/lib/types";

export default function FiredPlayersList({
  transactions,
  onUndo,
}: {
  transactions: Transaction[];
  onUndo: (id: string) => void;
}) {
  const fired = transactions.filter((t) => t.type === "kov");

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/90">Kovulanlar</h3>
        <span className="text-xs text-white/50">{fired.length}</span>
      </div>
      {fired.length === 0 ? (
        <p className="text-xs text-white/30 italic">Kovulan oyuncu yok</p>
      ) : (
        <div className="flex flex-col gap-2">
          {fired.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5">
              <div>
                <span className="font-semibold text-white">{t.playerName}</span>
                <div className="text-white/40 font-semibold">0 €</div>
              </div>
              <button
                onClick={() => onUndo(t.id)}
                className="text-[10px] px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white"
              >
                Geri Al
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
