"use client";

import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import type { Player } from "@/lib/types";

export default function PlayerChip({
  player,
  size = "md",
  onClick,
  draggable = true,
}: {
  player: Player;
  size?: "sm" | "md" | "lg";
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggable ? player.id : `static-${player.id}`,
    disabled: !draggable,
  });

  const dims = {
    sm: { box: 40, img: 34, text: "text-[9px]" },
    md: { box: 52, img: 44, text: "text-[10px]" },
    lg: { box: 64, img: 56, text: "text-xs" },
  }[size];

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : {};

  return (
    <button
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      onClick={onClick}
      style={style}
      className={`flex flex-col items-center gap-0.5 select-none touch-none ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div
        className="rounded-full overflow-hidden border-2 border-yellow-400 bg-red-900 shadow-md"
        style={{ width: dims.box, height: dims.box }}
      >
        <Image
          src={player.img}
          alt={player.name}
          width={dims.img}
          height={dims.img}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <span
        className={`${dims.text} font-semibold text-white bg-black/60 px-1 rounded max-w-[64px] truncate`}
      >
        {player.name}
      </span>
    </button>
  );
}
