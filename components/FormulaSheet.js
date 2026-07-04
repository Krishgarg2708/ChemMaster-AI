"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card } from "@/components/UI";
import notesData from "@/lib/data/notes.json";

function ChapterSheet({ note }) {
  return (
    <div className="sheet surface p-8 print:shadow-none print:border-none">
      <div className="flex items-baseline justify-between mb-1 print:mb-2">
        <h2 className="font-display text-2xl font-semibold">{note.chapter}</h2>
        <span className="font-mono text-xs text-slate-500">{note.class_level}</span>
      </div>
      <div className="text-[11px] uppercase tracking-widest text-flame-gold mb-4">
        Formula &amp; Quick-Recall Sheet
      </div>

      {note.key_formulae.length > 0 ? (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Key formulae</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {note.key_formulae.map((f, i) => (
              <code key={i} className="surface-2 px-3 py-2 rounded-md text-sm font-mono block">
                {f}
              </code>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-5">No formulae logged for this chapter (concept-heavy chapter).</p>
      )}

      {note.short_tricks.length > 0 && (
        <div className="mb-2">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Memory tricks</div>
          <ul className="space-y-1.5 text-sm">
            {note.short_tricks.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-flame-violet">›</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function FormulaSheetView() {
  const [classLevel, setClassLevel] = useState("All");
  const [selected, setSelected] = useState(null);

  const chapters = useMemo(() => {
    const base = [...notesData].sort((a, b) => a.order - b.order);
    if (classLevel === "All") return base;
    return base.filter((n) => n.class_level === classLevel);
  }, [classLevel]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="print:hidden">
        <PageHeader
          eyebrow="Revision · Formula Sheet"
          title="Formula &amp; Cheat-Sheet View"
          description="A printable one-pager per chapter, pulled straight from each chapter's key formulae and memory tricks. Pick a chapter, then print or save as PDF."
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Class 11", "Class 12"].map((c) => (
            <button
              key={c}
              onClick={() => setClassLevel(c)}
              className={`focus-ring rounded-full px-4 py-1.5 text-sm font-mono transition-colors ${
                classLevel === c
                  ? "bg-flame-gold text-ink"
                  : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!selected && (
          <div className="grid sm:grid-cols-2 gap-3">
            {chapters.map((n) => (
              <Card key={n.id} className="!p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm truncate">{n.chapter}</div>
                  <div className="text-[11px] text-slate-500">{n.class_level} · {n.key_formulae.length} formulae</div>
                </div>
                <button
                  onClick={() => setSelected(n.id)}
                  className="focus-ring shrink-0 rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors"
                >
                  Open sheet →
                </button>
              </Card>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelected(null)}
              className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
            >
              ← All chapters
            </button>
            <button
              onClick={() => window.print()}
              className="focus-ring rounded-lg bg-flame-gold text-ink font-medium px-4 py-2 text-sm"
            >
              Print / Save as PDF
            </button>
          </div>
        )}
      </div>

      {selected ? (
        <ChapterSheet note={notesData.find((n) => n.id === selected)} />
      ) : (
        <div className="hidden print:block">
          {chapters.map((n) => (
            <div key={n.id} className="print-page-break">
              <ChapterSheet note={n} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
