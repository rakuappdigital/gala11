"use client";

export type AmountUnit = "k" | "m";

function formatMoney(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n) + " €";
}

export function unitMultiplier(unit: AmountUnit) {
  return unit === "k" ? 1_000 : 1_000_000;
}

export default function AmountInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
}: {
  value: string;
  unit: AmountUnit;
  onValueChange: (v: string) => void;
  onUnitChange: (u: AmountUnit) => void;
}) {
  const total = (Number(value) || 0) * unitMultiplier(unit);

  return (
    <div className="mb-5">
      <div className="flex gap-2">
        <input
          autoFocus
          type="number"
          min={0}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="0"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-yellow-400"
        />
        <div className="flex rounded-lg border border-white/20 overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => onUnitChange("k")}
            className={`px-3 text-sm font-bold transition ${
              unit === "k" ? "bg-yellow-400 text-red-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            K
          </button>
          <button
            type="button"
            onClick={() => onUnitChange("m")}
            className={`px-3 text-sm font-bold transition ${
              unit === "m" ? "bg-yellow-400 text-red-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            M
          </button>
        </div>
      </div>
      <p className="text-xs text-white/50 mt-1.5">= {formatMoney(total)}</p>
    </div>
  );
}
