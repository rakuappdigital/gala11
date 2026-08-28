"use client";

import { useDroppable } from "@dnd-kit/core";
import PlayerChip from "./PlayerChip";
import { ALL_PLAYERS } from "@/lib/players-data";

export default function ListSection({
  id,
  title,
  playerIds,
  limit,
  onPlayerClick,
}: {
  id: string;
  title: string;
  playerIds: string[];
  limit?: number;
  onPlayerClick: (playerId: string, e: React.MouseEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-3 transition ${
        isOver ? "border-yellow-400 bg-yellow-400/10" : "border-white/15 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/90">{title}</h3>
        <span className="text-xs text-white/50">
          {playerIds.length}
          {limit ? ` / ${limit}` : ""}
        </span>
      </div>
      {playerIds.length === 0 ? (
        <p className="text-xs text-white/30 italic">Boş</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {playerIds.map((id) => {
            const player = ALL_PLAYERS[id];
            if (!player) return null;
            return (
              <PlayerChip
                key={id}
                player={player}
                size="sm"
                onClick={(e) => onPlayerClick(id, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
