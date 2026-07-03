"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/UI";
import { categoryColor } from "@/lib/categoryColors";
import ElementGrid from "@/components/ElementGrid";
import ElementDetailPanel from "@/components/ElementDetailPanel";
import ComparisonMode from "@/components/ComparisonMode";
import FlashcardMode from "@/components/FlashcardMode";
import QuizMode from "@/components/QuizMode";
import MnemonicsView from "@/components/MnemonicsView";
import allElements from "@/lib/data/elements.json";

const MODES = ["Browse", "Comparison", "Flashcards", "Quiz", "Mnemonics"];
const CATEGORIES = [...new Set(allElements.map((e) => e.category))].sort();

export default function PeriodicTablePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("Browse");
  const [selected, setSelected] = useState(1);
  const [elements, setElements] = useState(allElements);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    fetch(`/api/elements?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setElements(data.elements))
      .catch(() => setElements(allElements));
  }, [search, category]);

  const visibleSet = useMemo(() => new Set(elements.map((e) => e.atomic_number)), [elements]);
  const selectedElement = allElements.find((e) => e.atomic_number === selected);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Reference · 01"
        title="Interactive Periodic Table"
        description="All 118 elements. Search, filter by category, inspect, compare, drill with flashcards, or quiz yourself."
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`focus-ring rounded-full px-4 py-1.5 text-sm font-mono transition-colors ${
              mode === m
                ? "bg-flame-gold text-ink"
                : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Browse" && (
        <>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or symbol…"
              className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent flex-1"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent md:w-64"
            >
              <option value="" className="bg-ink-soft">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-ink-soft">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div>
              <ElementGrid
                elements={allElements}
                visibleSet={visibleSet}
                selected={selected}
                onSelect={setSelected}
              />
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-xs">
                {CATEGORIES.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: categoryColor(c) }}
                    />
                    <span className="text-slate-400">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <ElementDetailPanel element={selectedElement} />
          </div>
        </>
      )}

      {mode === "Comparison" && <ComparisonMode elements={allElements} />}
      {mode === "Flashcards" && <FlashcardMode elements={elements.length ? elements : allElements} />}
      {mode === "Quiz" && <QuizMode elements={elements.length ? elements : allElements} />}
      {mode === "Mnemonics" && <MnemonicsView />}
    </div>
  );
}
