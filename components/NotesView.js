"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/store";
import { PageHeader } from "@/components/UI";
import ChapterCard from "@/components/ChapterCard";
import allNotes from "@/lib/data/notes.json";

export default function NotesView({ classLevel, eyebrow }) {
  const { isComplete, hydrated } = useAppState();
  const [search, setSearch] = useState("");

  const chapters = useMemo(() => {
    const base = allNotes
      .filter((n) => n.class_level === classLevel)
      .sort((a, b) => a.order - b.order);
    if (!search.trim()) return base;
    const s = search.toLowerCase();
    return base.filter(
      (n) =>
        n.chapter.toLowerCase().includes(s) ||
        n.key_concepts.some((c) => c.toLowerCase().includes(s))
    );
  }, [search]);

  const doneCount = hydrated
    ? allNotes.filter((n) => n.class_level === classLevel && isComplete(n.class_level, n.chapter)).length
    : 0;
  const total = allNotes.filter((n) => n.class_level === classLevel).length;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow={eyebrow}
        title={`${classLevel} Chemistry — Chapter Notes`}
        description="NCERT-aligned notes: detailed explanations, key concepts, formulae, memory tricks, and leveled practice questions (Easy to JEE Advanced) for every chapter."
      />

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>
            {doneCount} / {total} chapters complete
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-soft overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-flame-crimson via-flame-gold to-flame-copper transition-all"
            style={{ width: total ? `${(doneCount / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search chapters or topics…"
        className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent w-full mb-6"
      />

      <div className="flex flex-col gap-3">
        {chapters.map((note) => (
          <ChapterCard key={note.id} note={note} />
        ))}
        {chapters.length === 0 && (
          <p className="text-slate-500 text-sm">No chapters match your search.</p>
        )}
      </div>
    </div>
  );
}
