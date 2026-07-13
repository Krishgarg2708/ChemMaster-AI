"use client";

import { categoryColor } from "@/lib/categoryColors";
function computeGrid(elements) {
  const grid = {};
  let laCount = 0;
  let acCount = 0;
  for (const e of elements) {
    if (e.category === "Lanthanide") {
      grid[e.atomic_number] = { row: 8, col: 3 + laCount };
      laCount += 1;
    } else if (e.category === "Actinide") {
      grid[e.atomic_number] = { row: 9, col: 3 + acCount };
      acCount += 1;
    } else {
      grid[e.atomic_number] = { row: e.period, col: e.group };
    }
  }
  return grid;
}

export default function ElementGrid({ elements, visibleSet, selected, onSelect }) {
  const grid = computeGrid(elements);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid gap-1 min-w-[900px]"
        style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
      >
        {elements.map((e) => {
          const pos = grid[e.atomic_number];
          const dim = !visibleSet.has(e.atomic_number);
          const isSelected = selected === e.atomic_number;
          const color = categoryColor(e.category);
          return (
            <button
              key={e.atomic_number}
              onClick={() => onSelect(e.atomic_number)}
              style={{
                gridRow: pos.row,
                gridColumn: pos.col,
                borderColor: color,
                opacity: dim ? 0.22 : 1,
                boxShadow: isSelected ? `0 0 0 2px ${color}` : "none",
              }}
              className="focus-ring group relative aspect-square rounded-md border text-left px-1 py-0.5 bg-ink-soft hover:-translate-y-0.5 hover:z-10 transition-all"
              title={`${e.name} — ${e.category}`}
            >
              <div className="font-mono text-[8px] text-slate-500 leading-none">
                {e.atomic_number}
              </div>
              <div
                className="font-mono font-bold leading-tight text-[13px] md:text-sm"
                style={{ color }}
              >
                {e.symbol}
              </div>
              <div className="text-[6.5px] md:text-[7px] text-slate-500 leading-none truncate">
                {e.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
