"use client";

import { useAppState } from "@/lib/store";
import { categoryColor } from "@/lib/categoryColors";
import { Card, Chip } from "@/components/UI";
import AtomOrbit from "@/components/AtomOrbit";

const FIELDS = [
  ["Atomic number", "atomic_number"],
  ["Atomic mass", "atomic_mass"],
  ["Period / Group", null],
  ["Block", "block"],
  ["Electronic config", "electronic_configuration"],
  ["Oxidation states", "oxidation_states"],
  ["Valency", "valency"],
];

export default function ElementDetailPanel({ element }) {
  const { toggleBookmark, isBookmarked, logActivity } = useAppState();
  if (!element) return null;
  const color = categoryColor(element.category);
  const bookmarked = isBookmarked("element", element.atomic_number);

  return (
    <Card className="sticky top-6">
      <div className="-mx-2 -mt-2 mb-2">
        <AtomOrbit key={element.atomic_number} element={element} color={color} size={300} className="w-full h-auto" />
      </div>
      <h2 className="font-display text-3xl font-semibold mb-2">{element.name}</h2>
      <Chip tone="gold">{element.category}</Chip>

      <div className="mt-5 space-y-2 text-sm">
        {FIELDS.map(([label, key]) =>
          key ? (
            <div key={label} className="flex justify-between gap-4 border-b border-ink-border/60 py-1.5">
              <span className="text-slate-500">{label}</span>
              <span className="font-mono text-right">{element[key]}</span>
            </div>
          ) : (
            <div key={label} className="flex justify-between gap-4 border-b border-ink-border/60 py-1.5">
              <span className="text-slate-500">{label}</span>
              <span className="font-mono text-right">
                {element.period} / {element.group}
              </span>
            </div>
          )
        )}
        <div className="flex justify-between gap-4 border-b border-ink-border/60 py-1.5">
          <span className="text-slate-500">Discovered by</span>
          <span className="text-right">
            {element.discovered_by}
            {element.discovery_year ? `, ${element.discovery_year}` : ""}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-slate-500 text-xs mb-1">Uses</div>
        <p className="text-sm leading-relaxed">{element.uses}</p>
      </div>

      <div className="mt-4 surface-2 p-3 text-sm">
        <span className="text-flame-gold font-medium text-xs">Did you know? </span>
        {element.fact}
      </div>

      <button
        onClick={() => {
          const now = toggleBookmark("element", element.atomic_number);
          logActivity(`${now ? "Bookmarked" : "Removed bookmark for"} ${element.name}`);
        }}
        className="focus-ring mt-5 w-full rounded-lg border border-ink-border px-4 py-2.5 text-sm hover:bg-ink-soft transition-colors"
      >
        {bookmarked ? "★ Remove bookmark" : "☆ Bookmark this element"}
      </button>
    </Card>
  );
}
