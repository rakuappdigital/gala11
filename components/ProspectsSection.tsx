"use client";

import Image from "next/image";
import { ALL_PLAYERS } from "@/lib/players-data";

export default function ProspectsSection({
  playerIds,
  onAdd,
}: {
  playerIds: string[];
  onAdd: (playerId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/90">Muhtemel</h3>
        <span className="text-xs text-white/50">{playerIds.length}</span>
      </div>
      {playerIds.length === 0 ? (
        <p className="text-xs text-white/30 italic">Boş</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {playerIds.map((id) => {
            const player = ALL_PLAYERS[id];
            if (!player) return null;
            return (
              <div key={id} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-red-900">
                  <Image
                    src={player.img}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] text-white/80 max-w-[56px] truncate">
                  {player.name}
                </span>
                <button
                  onClick={() => onAdd(id)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400 text-red-900 font-semibold hover:bg-yellow-300"
                >
                  Takıma Al
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
