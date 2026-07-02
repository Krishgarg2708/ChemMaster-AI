"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { Card } from "@/components/UI";

export default function ChapterCard({ note }) {
  const { isComplete, setProgress, isBookmarked, toggleBookmark, addXp, logActivity } = useAppState();
  const [open, setOpen] = useState(false);

  const done = isComplete(note.class_level, note.chapter);
  const bookmarked = isBookmarked("note", note.id);

  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs text-slate-500 shrink-0">
            {String(note.order).padStart(2, "0")}
          </span>
          <span className={`truncate ${done ? "text-flame-copper" : ""}`}>{note.chapter}</span>
          {bookmarked && <span className="text-flame-gold shrink-0">★</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {done && <span className="text-[11px] font-mono text-flame-copper">DONE</span>}
          <span className="text-slate-500 text-sm">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-ink-border pt-4">
          <div className="mb-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
              Key concepts
            </div>
            <ul className="space-y-1.5 text-sm">
              {note.key_concepts.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-flame-gold">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {note.key_formulae.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                Key formulae
              </div>
              <div className="flex flex-col gap-1.5">
                {note.key_formulae.map((f, i) => (
                  <code key={i} className="surface-2 px-3 py-1.5 rounded-md text-xs font-mono w-fit">
                    {f}
                  </code>
                ))}
              </div>
            </div>
          )}

          {note.short_tricks.length > 0 && (
            <div className="mb-5">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                Memory tricks
              </div>
              <div className="space-y-2">
                {note.short_tricks.map((t, i) => (
                  <div
                    key={i}
                    className="text-sm rounded-md border-l-2 border-flame-violet bg-ink-soft/60 pl-3 pr-3 py-2"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setProgress(note.class_level, note.chapter, !done);
                if (!done) {
                  addXp(10);
                  logActivity(`Completed ${note.chapter}`);
                }
              }}
              className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
            >
              {done ? "Mark incomplete" : "Mark complete ✓"}
            </button>
            <button
              onClick={() => {
                const now = toggleBookmark("note", note.id);
                logActivity(`${now ? "Bookmarked" : "Removed bookmark for"} notes: ${note.chapter}`);
              }}
              className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
            >
              {bookmarked ? "★ Remove bookmark" : "☆ Bookmark"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
