"use client";

import PlayerChip from "./PlayerChip";
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
      {filled.length === 0 ? (
        <p className="text-xs text-white/30 italic">Saha boş — oyuncuları sürükleyerek yerleştir</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filled.map((slot) => {
            const player = ALL_PLAYERS[starters[slot.id] as string];
            if (!player) return null;
            return (
              <PlayerChip
                key={slot.id}
                player={player}
                size="sm"
                draggable={false}
                onClick={(e) => onPlayerClick(player.id, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
