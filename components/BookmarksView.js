"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader, Card, Chip } from "@/components/UI";
import { useAppState } from "@/lib/store";
import notesData from "@/lib/data/notes.json";
import elementsData from "@/lib/data/elements.json";
import allQuestions from "@/lib/data/questions.json";
import reactionsData from "@/lib/data/named_reactions.json";
import pyqData from "@/lib/data/pyq.json";

export default function BookmarksView() {
  const { state, hydrated, toggleBookmark } = useAppState();

  const grouped = useMemo(() => {
    if (!hydrated) return {};
    const g = { note: [], element: [], question: [], reaction: [], pyq: [] };
    for (const b of state.bookmarks) {
      if (b.type === "note") {
        const n = notesData.find((x) => String(x.id) === b.ref);
        if (n) g.note.push({ ref: b.ref, label: n.chapter, sub: n.class_level, href: n.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12" });
      } else if (b.type === "element") {
        const e = elementsData.find((x) => String(x.atomic_number) === b.ref);
        if (e) g.element.push({ ref: b.ref, label: `${e.name} (${e.symbol})`, sub: `Z=${e.atomic_number}`, href: "/periodic-table" });
      } else if (b.type === "question") {
        const [noteId, level] = b.ref.split(":");
        const entry = allQuestions.find((q) => String(q.note_id) === noteId);
        const q = entry?.questions?.[level];
        if (q) g.question.push({ ref: b.ref, label: q.question, sub: `${entry.chapter} · ${level.replace("_", " ")}`, href: entry.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12" });
      } else if (b.type === "reaction") {
        const r = reactionsData.find((x) => String(x.id) === b.ref);
        if (r) g.reaction.push({ ref: b.ref, label: r.name, sub: r.category, href: "/named-reactions" });
      } else if (b.type === "pyq") {
        const p = pyqData.find((x) => String(x.id) === b.ref);
        if (p) g.pyq.push({ ref: b.ref, label: p.question, sub: `${p.chapter} · ${p.style}`, href: "/pyq-bank" });
      }
    }
    return g;
  }, [hydrated, state.bookmarks]);

  const SECTIONS = [
    { key: "note", label: "Chapters", type: "note" },
    { key: "question", label: "Practice questions", type: "question" },
    { key: "pyq", label: "PYQ bank questions", type: "pyq" },
    { key: "reaction", label: "Named reactions", type: "reaction" },
    { key: "element", label: "Elements", type: "element" },
  ];

  const total = hydrated ? state.bookmarks.length : 0;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Saved · Bookmarks"
        title="Your Bookmarks"
        description="Everything you've starred across chapters, individual practice questions, PYQs, named reactions, and elements - all in one place."
      />

      {total === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            Nothing bookmarked yet. Look for the ☆ / ★ icons on chapters, practice questions, PYQs,
            named reactions, and elements.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {SECTIONS.map((sec) => {
            const items = grouped[sec.key] || [];
            if (items.length === 0) return null;
            return (
              <div key={sec.key}>
                <div className="eyebrow mb-3">{sec.label} ({items.length})</div>
                <div className="flex flex-col gap-2">
                  {items.map((it) => (
                    <Card key={it.ref} className="!p-4 flex items-center justify-between gap-3">
                      <Link href={it.href} className="focus-ring min-w-0 flex-1">
                        <div className="text-sm truncate">{it.label}</div>
                        <div className="text-[11px] text-slate-500 truncate">{it.sub}</div>
                      </Link>
                      <button
                        onClick={() => toggleBookmark(sec.type, it.ref)}
                        className="focus-ring shrink-0 text-flame-gold text-sm hover:opacity-80"
                        title="Remove bookmark"
                      >
                        ★
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
