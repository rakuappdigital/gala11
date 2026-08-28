"use client";

import { getFormation } from "@/lib/formations";
import { ALL_PLAYERS } from "@/lib/players-data";
import type { SlotAssignment } from "@/lib/types";

export default function StartersMirrorList({
  formation,
  starters,
  onPlayerClick,
}: {
  formation: string;
  starters: SlotAssignment;
  onPlayerClick: (playerId: string, e: React.MouseEvent) => void;
}) {
  const slots = getFormation(formation).slots;
  const filled = slots.filter((s) => starters[s.id]);

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/90">İlk 11</h3>
        <span className="text-xs text-white/50">{filled.length} / 11</span>
      </div>
      <ul className="flex flex-col gap-1">
        {filled.map((slot) => {
          const player = ALL_PLAYERS[starters[slot.id] as string];
          if (!player) return null;
          return (
            <li key={slot.id}>
              <button
                onClick={(e) => onPlayerClick(player.id, e)}
                className="w-full text-left text-xs text-white/90 bg-white/5 hover:bg-white/15 rounded px-2 py-1 transition"
              >
                {player.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
