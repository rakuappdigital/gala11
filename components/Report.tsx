"use client";

import { forwardRef } from "react";
import { getFormation } from "@/lib/formations";
import { ALL_PLAYERS } from "@/lib/players-data";
import type { SlotAssignment, Transaction } from "@/lib/types";
import { transactionDirection } from "@/lib/types";

const REPORT_WIDTH = 1080;
const PITCH_WIDTH = 760;
const PITCH_HEIGHT = Math.round((PITCH_WIDTH * 100) / 68);

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

function MiniPitch({ formation, starters }: { formation: string; starters: SlotAssignment }) {
  const slots = getFormation(formation).slots;
  return (
    <div
      className="relative rounded-2xl overflow-hidden border-2 border-white/25 shadow-lg mx-auto"
      style={{
        width: PITCH_WIDTH,
        height: PITCH_HEIGHT,
        background: "repeating-linear-gradient(0deg, #176b2e, #176b2e 10%, #1c7d36 10%, #1c7d36 20%)",
      }}
    >
      <div className="absolute inset-4 border-2 border-white/40 rounded-sm" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/40" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full border-t-2 border-white/40" />

      {slots.map((slot) => {
        const playerId = starters[slot.id];
        const player = playerId ? ALL_PLAYERS[playerId] : null;
        return (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {player ? (
              <>
                <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-[3px] border-yellow-400 bg-red-900 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[15px] font-bold bg-black/70 px-2 py-0.5 rounded-md max-w-[110px] truncate">
                  {player.name}
                </span>
              </>
            ) : (
              <div className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-white/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BenchRow({ bench }: { bench: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-5">
      {bench.map((id) => {
        const player = ALL_PLAYERS[id];
        if (!player) return null;
        return (
          <div key={id} className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 bg-red-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[12px] text-white/80 max-w-[64px] truncate text-center">{player.name}</span>
          </div>
        );
      })}
      {bench.length === 0 && <p className="text-xs text-white/30 italic">Boş</p>}
    </div>
  );
}

function SquadCard({ label, board }: { label: string; board: ReportBoard }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-xl p-7">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-2xl font-black text-white">{label}</h2>
        <span className="text-sm font-semibold text-yellow-400/90 bg-yellow-400/10 px-3 py-1 rounded-full">
          {board.formation}
        </span>
      </div>
      <MiniPitch formation={board.formation} starters={board.starters} />
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wide text-white/40 mb-2 text-center">
          Yedekler ({board.bench.length}/7)
        </h3>
        <BenchRow bench={board.bench} />
      </div>
    </div>
  );
}

function TransferColumn({
  title,
  items,
  accent,
}: {
  title: string;
  items: { id: string; playerName: string; amount: number; type: Transaction["type"] }[];
  accent: "green" | "red" | "neutral";
}) {
  const color = accent === "green" ? "text-green-400" : accent === "red" ? "text-red-400" : "text-white/50";
  const sign = accent === "green" ? "+" : accent === "red" ? "-" : "";

  return (
    <div>
      <h3 className="text-sm font-bold text-white/90 mb-2.5">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-white/30 italic">Yok</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
              <span className="text-white/90">
                {t.playerName}
                {t.type !== "kov" && <span className="text-white/40"> ({TYPE_LABELS[t.type]})</span>}
              </span>
              <span className={`font-bold ${color}`}>
                {t.type === "kov" ? "0 €" : `${sign}${formatMoney(t.amount)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
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
  const net = gelir - gider;
  const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date());

  return (
    <div
      ref={ref}
      style={{ width: REPORT_WIDTH, fontFamily: "system-ui, sans-serif" }}
      className="bg-gradient-to-b from-red-950 via-red-900 to-neutral-950 text-white px-8 py-10 flex flex-col gap-7"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-red-900 font-black text-2xl shadow-lg">
          GS
        </div>
        <div>
          <h1 className="text-3xl font-black leading-tight">gala11</h1>
          <p className="text-white/50 text-sm">Kadro Raporu · {date}</p>
        </div>
      </div>

      <SquadCard label="As Kadro" board={asBoard} />
      {yedekBoard && <SquadCard label="Yedek Kadro" board={yedekBoard} />}

      <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-xl p-7">
        <h2 className="text-xl font-black mb-5">Kasa</h2>
        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 text-center">
            <div className="text-green-400/70 text-xs font-semibold">Gelir</div>
            <div className="text-green-400 font-black text-lg mt-0.5">{formatMoney(gelir)}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
            <div className="text-red-400/70 text-xs font-semibold">Gider</div>
            <div className="text-red-400 font-black text-lg mt-0.5">{formatMoney(gider)}</div>
          </div>
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-4 py-3 text-center">
            <div className="text-yellow-400/70 text-xs font-semibold">Net</div>
            <div className="text-yellow-400 font-black text-lg mt-0.5">{formatMoney(net)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <TransferColumn
            title="Giden Oyuncular"
            accent="green"
            items={gelirList.map((t) => ({ id: t.id, playerName: t.playerName, amount: t.amount, type: t.type }))}
          />
          <TransferColumn
            title="Gelen Oyuncular (Transferler)"
            accent="red"
            items={giderList.map((t) => ({ id: t.id, playerName: t.playerName, amount: t.amount, type: t.type }))}
          />
          <TransferColumn
            title="Kovulanlar"
            accent="neutral"
            items={firedList.map((t) => ({ id: t.id, playerName: t.playerName, amount: 0, type: t.type }))}
          />
        </div>
      </div>

      <p className="text-center text-white/25 text-xs">gala11.vercel.app</p>
    </div>
  );
});

export default Report;
