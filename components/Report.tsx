"use client";

import { forwardRef } from "react";
import { getFormation } from "@/lib/formations";
import { ALL_PLAYERS } from "@/lib/players-data";
import type { SlotAssignment, Transaction } from "@/lib/types";
import { transactionDirection } from "@/lib/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n) + " €";
}

const TYPE_LABELS: Record<Transaction["type"], string> = {
  sat: "Satış",
  kirala: "Kiralık",
  "satin-al": "Transfer",
  kov: "Kovuldu",
};

type ReportBoard = { formation: string; starters: SlotAssignment; bench: string[] };

function MiniPitch({ formation, starters, width, height }: { formation: string; starters: SlotAssignment; width: number; height: number }) {
  const slots = getFormation(formation).slots;
  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 border-white/30"
      style={{
        width,
        height,
        background: "repeating-linear-gradient(0deg, #1a7a34, #1a7a34 10%, #1f8a3b 10%, #1f8a3b 20%)",
      }}
    >
      <div className="absolute inset-3 border-2 border-white/50 rounded-sm" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/50" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full border-t-2 border-white/50" />

      {slots.map((slot) => {
        const playerId = starters[slot.id];
        const player = playerId ? ALL_PLAYERS[playerId] : null;
        return (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {player ? (
              <>
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400 bg-red-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold bg-black/60 px-1.5 rounded max-w-[80px] truncate">
                  {player.name}
                </span>
              </>
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BenchList({ bench }: { bench: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-white/90 mb-2">Yedekler ({bench.length}/7)</h2>
      <div className="flex flex-wrap gap-3">
        {bench.map((id) => {
          const player = ALL_PLAYERS[id];
          if (!player) return null;
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 bg-red-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-white/80 max-w-[56px] truncate">{player.name}</span>
            </div>
          );
        })}
        {bench.length === 0 && <p className="text-xs text-white/30 italic">Boş</p>}
      </div>
    </div>
  );
}

const Report = forwardRef<
  HTMLDivElement,
  {
    asBoard: ReportBoard;
    yedekBoard?: ReportBoard;
    transactions: Transaction[];
  }
>(function Report({ asBoard, yedekBoard, transactions }, ref) {
  const gelirList = transactions.filter((t) => t.type !== "kov" && transactionDirection(t.type) === "gelir");
  const giderList = transactions.filter((t) => transactionDirection(t.type) === "gider" && t.type !== "kov");
  const firedList = transactions.filter((t) => t.type === "kov");
  const gelir = gelirList.reduce((s, t) => s + t.amount, 0);
  const gider = giderList.reduce((s, t) => s + t.amount, 0);
  const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(new Date());
  const pitchSize = yedekBoard ? { w: 460, h: 600 } : { w: 600, h: 780 };

  return (
    <div ref={ref} style={{ width: 1200, fontFamily: "system-ui, sans-serif" }} className="bg-gradient-to-b from-red-950 via-red-900 to-neutral-950 text-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-red-900 font-black text-xl">
          GS
        </div>
        <div>
          <h1 className="text-2xl font-black">gala11 — Kadro Raporu</h1>
          <p className="text-white/50 text-sm">{date}</p>
        </div>
      </div>

      <div className={`grid gap-6 mb-6 ${yedekBoard ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">As Kadro <span className="text-white/40 text-sm font-normal">({asBoard.formation})</span></h2>
          <MiniPitch formation={asBoard.formation} starters={asBoard.starters} width={pitchSize.w} height={pitchSize.h} />
          <BenchList bench={asBoard.bench} />
        </div>

        {yedekBoard && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Yedek Kadro <span className="text-white/40 text-sm font-normal">({yedekBoard.formation})</span></h2>
            <MiniPitch formation={yedekBoard.formation} starters={yedekBoard.starters} width={pitchSize.w} height={pitchSize.h} />
            <BenchList bench={yedekBoard.bench} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded px-3 py-2">
              <div className="text-green-400/70 text-xs">Gelir</div>
              <div className="text-green-400 font-bold">{formatMoney(gelir)}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              <div className="text-red-400/70 text-xs">Gider</div>
              <div className="text-red-400 font-bold">{formatMoney(gider)}</div>
            </div>
          </div>
        </div>
        <div />
        <div />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-2">
        <div>
          <h2 className="text-sm font-bold text-white/90 mb-2">Giden Oyuncular</h2>
          {gelirList.length === 0 ? (
            <p className="text-xs text-white/30 italic">Kimse gitmedi</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {gelirList.map((t) => (
                <li key={t.id} className="text-xs flex justify-between bg-white/5 rounded px-2 py-1">
                  <span>
                    {t.playerName} <span className="text-white/40">({TYPE_LABELS[t.type]})</span>
                  </span>
                  <span className="text-green-400 font-semibold">+{formatMoney(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-white/90 mb-2">Gelen Oyuncular (Transferler)</h2>
          {giderList.length === 0 ? (
            <p className="text-xs text-white/30 italic">Yeni transfer yok</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {giderList.map((t) => (
                <li key={t.id} className="text-xs flex justify-between bg-white/5 rounded px-2 py-1">
                  <span>{t.playerName}</span>
                  <span className="text-red-400 font-semibold">-{formatMoney(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-white/90 mb-2">Kovulanlar</h2>
          {firedList.length === 0 ? (
            <p className="text-xs text-white/30 italic">Kovulan yok</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {firedList.map((t) => (
                <li key={t.id} className="text-xs flex justify-between bg-white/5 rounded px-2 py-1">
                  <span>{t.playerName}</span>
                  <span className="text-white/40 font-semibold">0 €</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

export default Report;
