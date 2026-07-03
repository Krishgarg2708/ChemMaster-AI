"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { Card } from "@/components/UI";
import allQuestions from "@/lib/data/questions.json";

const LEVELS = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
  { key: "jee_main", label: "JEE Main" },
  { key: "jee_advanced", label: "JEE Advanced" },
];

function PracticeQuestions({ noteId }) {
  const entry = allQuestions.find((q) => q.note_id === noteId);
  const [level, setLevel] = useState("easy");
  const [revealed, setRevealed] = useState(false);

  if (!entry) return null;
  const q = entry.questions[level];

  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
        Practice questions
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => {
              setLevel(l.key);
              setRevealed(false);
            }}
            className={`focus-ring rounded-full px-3 py-1 text-[11px] font-mono transition-colors ${
              level === l.key
                ? "bg-flame-gold text-ink"
                : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {q && (
        <div className="surface-2 rounded-lg p-4">
          <p className="text-sm mb-3">{q.question}</p>
          <div className="flex flex-col gap-1.5 mb-3">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`text-sm rounded-md px-3 py-1.5 border ${
                  revealed && i === q.answer
                    ? "border-flame-copper text-flame-copper bg-flame-copper/10"
                    : "border-ink-border"
                }`}
              >
                <span className="font-mono text-xs text-slate-500 mr-2">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            ))}
          </div>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="focus-ring rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors mb-2"
          >
            {revealed ? "Hide answer" : "Show answer"}
          </button>
          {revealed && (
            <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-flame-gold pl-3">
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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
          {note.detailed_notes && (
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                Detailed notes
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{note.detailed_notes}</p>
            </div>
          )}

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

          <PracticeQuestions noteId={note.id} />

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

