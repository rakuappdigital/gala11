"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export type MenuAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export default function ActionMenu({
  x,
  y,
  actions,
  onClose,
}: {
  x: number;
  y: number;
  actions: MenuAction[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Keep the menu fully inside the viewport — flips left/up when the click
  // happens near the right or bottom edge (common on mobile).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const margin = 8;
    const rect = el.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - margin) {
      left = window.innerWidth - rect.width - margin;
    }
    if (left < margin) left = margin;
    if (top + rect.height > window.innerHeight - margin) {
      top = window.innerHeight - rect.height - margin;
    }
    if (top < margin) top = margin;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-neutral-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden min-w-[140px]"
      style={{ left: x, top: y }}
    >
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => {
            a.onClick();
            onClose();
          }}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${
            a.danger ? "text-red-400" : "text-white"
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
