"use client";

import Image from "next/image";
import { ALL_PLAYERS } from "@/lib/players-data";
import { PROSPECT_ROLES, ROLE_LABELS } from "@/lib/player-roles";

export default function ProspectsSection({
  playerIds,
  onPlayerClick,
}: {
  playerIds: string[];
  onPlayerClick: (playerId: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/90">Muhtemel Transferler</h3>
        <span className="text-xs text-white/50">{playerIds.length}</span>
      </div>
      {playerIds.length === 0 ? (
        <p className="text-xs text-white/30 italic">Boş</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {playerIds.map((id) => {
            const player = ALL_PLAYERS[id];
            if (!player) return null;
            return (
              <button
                key={id}
                onClick={(e) => onPlayerClick(id, e)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-red-900">
                  <Image
                    src={player.img}
                    alt={player.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-white/80 max-w-[70px] truncate">{player.name}</span>
                {ROLE_LABELS[PROSPECT_ROLES[id]] && (
                  <span className="text-[9px] text-yellow-400/80 max-w-[70px] text-center leading-tight">
                    {ROLE_LABELS[PROSPECT_ROLES[id]]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
