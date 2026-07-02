"use client";

import { useEffect, useState } from "react";
import { categoryColor } from "@/lib/categoryColors";
import { Card } from "@/components/UI";

export default function FlashcardMode({ elements }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [elements]);

  if (elements.length === 0) return <p className="text-slate-500">No elements match your filters.</p>;

  const el = elements[index % elements.length];
  const color = categoryColor(el.category);

  return (
    <div className="max-w-xl mx-auto">
      <Card
        className="!p-10 text-center cursor-pointer min-h-[280px] flex flex-col items-center justify-center"
        onClick={() => setFlipped((f) => !f)}
      >
        {!flipped ? (
          <>
            <div className="font-mono text-7xl font-bold mb-3" style={{ color }}>
              {el.symbol}
            </div>
            <p className="text-slate-500 text-sm">
              Atomic number {el.atomic_number} · Click to reveal
            </p>
          </>
        ) : (
          <>
            <h3 className="font-display text-2xl font-semibold mb-2">{el.name}</h3>
            <p className="font-mono text-sm text-flame-copper mb-3">
              Mass {el.atomic_mass} · {el.electronic_configuration}
            </p>
            <p className="text-sm text-slate-400 max-w-sm">{el.fact}</p>
          </>
        )}
      </Card>

      <div className="flex items-center justify-between mt-5">
        <button
          className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
          onClick={() => {
            setIndex((i) => (i - 1 + elements.length) % elements.length);
            setFlipped(false);
          }}
        >
          ← Previous
        </button>
        <span className="text-xs text-slate-500 font-mono">
          {(index % elements.length) + 1} / {elements.length}
        </span>
        <button
          className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
          onClick={() => {
            setIndex((i) => (i + 1) % elements.length);
            setFlipped(false);
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
