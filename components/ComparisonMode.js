"use client";

import { useState } from "react";
import { categoryColor } from "@/lib/categoryColors";
import { Card } from "@/components/UI";

const FIELDS = [
  ["Atomic number", "atomic_number"],
  ["Atomic mass", "atomic_mass"],
  ["Period", "period"],
  ["Group", "group"],
  ["Block", "block"],
  ["Category", "category"],
  ["Electronic config", "electronic_configuration"],
  ["Oxidation states", "oxidation_states"],
  ["Valency", "valency"],
  ["Discovered by", "discovered_by"],
  ["Discovery year", "discovery_year"],
];

export default function ComparisonMode({ elements }) {
  const [aZ, setAZ] = useState(elements[0]?.atomic_number);
  const [bZ, setBZ] = useState(elements[7]?.atomic_number ?? elements[0]?.atomic_number);

  const a = elements.find((e) => e.atomic_number === Number(aZ));
  const b = elements.find((e) => e.atomic_number === Number(bZ));

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={aZ}
          onChange={(e) => setAZ(e.target.value)}
          className="focus-ring surface-2 rounded-lg px-4 py-3 text-sm bg-transparent"
        >
          {elements.map((e) => (
            <option key={e.atomic_number} value={e.atomic_number} className="bg-ink-soft">
              {e.symbol} — {e.name}
            </option>
          ))}
        </select>
        <select
          value={bZ}
          onChange={(e) => setBZ(e.target.value)}
          className="focus-ring surface-2 rounded-lg px-4 py-3 text-sm bg-transparent"
        >
          {elements.map((e) => (
            <option key={e.atomic_number} value={e.atomic_number} className="bg-ink-soft">
              {e.symbol} — {e.name}
            </option>
          ))}
        </select>
      </div>

      {a && b && (
        <div className="grid md:grid-cols-2 gap-4">
          {[a, b].map((el) => (
            <Card key={el.atomic_number}>
              <div className="font-mono text-3xl font-bold" style={{ color: categoryColor(el.category) }}>
                {el.symbol}
              </div>
              <div className="font-display text-xl mb-4">{el.name}</div>
              <div className="space-y-2 text-sm">
                {FIELDS.map(([label, key]) => (
                  <div key={label} className="flex justify-between border-b border-ink-border/60 py-1.5">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-mono text-right">{el[key]}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
