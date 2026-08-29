"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import PlayerChip from "./PlayerChip";
import { getFormation, FORMATIONS } from "@/lib/formations";
import { ALL_PLAYERS } from "@/lib/players-data";
import type { SlotAssignment } from "@/lib/types";

function PitchSlot({
  slotId,
  x,
  y,
  playerId,
  onPlayerClick,
  loanedIds,
}: {
  slotId: string;
  x: number;
  y: number;
  playerId: string | null;
  onPlayerClick: (playerId: string, e: React.MouseEvent) => void;
  loanedIds: string[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotId}` });
  const player = playerId ? ALL_PLAYERS[playerId] : null;

  return (
    <div
      ref={setNodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={`rounded-full transition-transform ${
          isOver ? "scale-110 ring-4 ring-yellow-300/70" : ""
        }`}
      >
        {player ? (
          <PlayerChip
            player={player}
            size="md"
            onClick={(e) => onPlayerClick(player.id, e)}
            onLoan={loanedIds.includes(player.id)}
          />
        ) : (
          <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-white/40 bg-white/5" />
        )}
      </div>
    </div>
  );
}

export default function Pitch({
  formation,
  starters,
  onFormationChange,
  onPlayerClick,
  loanedIds = [],
}: {
  formation: string;
  starters: SlotAssignment;
  onFormationChange: (name: string) => void;
  onPlayerClick: (playerId: string, e: React.MouseEvent) => void;
  loanedIds?: string[];
}) {
  const slots = getFormation(formation).slots;
  const [half, setHalf] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full max-w-[440px] mx-auto lg:mx-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-white/70 font-medium">Formasyon:</span>
        {FORMATIONS.map((f) => (
          <button
            key={f.name}
            onClick={() => onFormationChange(f.name)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              f.name === formation
                ? "bg-yellow-400 text-red-900 border-yellow-400"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70 font-medium">Saha:</span>
        <button
          onClick={() => setHalf(false)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
            !half
              ? "bg-yellow-400 text-red-900 border-yellow-400"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          Tam Saha
        </button>
        <button
          onClick={() => setHalf(true)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
            half
              ? "bg-yellow-400 text-red-900 border-yellow-400"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          Yarım Saha
        </button>
      </div>

      <div
        className="relative w-full rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl"
        style={{
          aspectRatio: half ? "68 / 62" : "68 / 100",
          background:
            "repeating-linear-gradient(0deg, #1a7a34, #1a7a34 10%, #1f8a3b 10%, #1f8a3b 20%)",
        }}
      >
        <div className="absolute inset-3 border-2 border-white/50 rounded-sm" />
        {!half && (
          <>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/50" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full border-t-2 border-white/50" />
          </>
        )}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 w-[45%] h-[16%] border-2 border-t-0 border-white/50" />
        <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-[45%] h-[16%] border-2 border-b-0 border-white/50" />

        {slots.map((slot) => (
          <PitchSlot
            key={slot.id}
            slotId={slot.id}
            x={slot.x}
            y={slot.y}
            playerId={starters[slot.id] ?? null}
            onPlayerClick={onPlayerClick}
            loanedIds={loanedIds}
          />
        ))}
      </div>
    </div>
  );
}
