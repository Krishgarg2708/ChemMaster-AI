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

function PracticeQuestions({ noteId, classLevel, chapter }) {
  const entry = allQuestions.find((q) => q.note_id === noteId);
  const [level, setLevel] = useState("easy");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState(null);
  const { isBookmarked, toggleBookmark, logAttempt, addXp } = useAppState();

  if (!entry) return null;
  // each level holds an array of questions (older data held a single object)
  const raw = entry.questions[level];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const total = Object.values(entry.questions).reduce(
    (acc, v) => acc + (Array.isArray(v) ? v.length : v ? 1 : 0),
    0
  );
  const q = list[index];
  const qRef = `${noteId}:${level}:${index}`;
  const qBookmarked = isBookmarked("question", qRef);

  const reset = () => {
    setRevealed(false);
    setChoice(null);
  };

  const selectChoice = (i) => {
    if (revealed) return;
    setChoice(i);
    setRevealed(true);
    const correct = i === q.answer;
    logAttempt(classLevel, chapter, correct);
    if (correct) addXp(2);
  };

  const goTo = (i) => {
    setIndex(i);
    reset();
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Practice questions · {total} in this chapter
        </div>
        <button
          onClick={() => toggleBookmark("question", qRef)}
          className="focus-ring text-xs text-flame-gold hover:opacity-80 transition-opacity"
          title="Bookmark this question"
        >
          {qBookmarked ? "★ Saved" : "☆ Save question"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {LEVELS.map((l) => {
          const r = entry.questions[l];
          const count = Array.isArray(r) ? r.length : r ? 1 : 0;
          return (
            <button
              key={l.key}
              onClick={() => {
                setLevel(l.key);
                setIndex(0);
                reset();
              }}
              className={`focus-ring rounded-full px-3 py-1 text-[11px] font-mono transition-colors ${
                level === l.key
                  ? "bg-flame-gold text-ink"
                  : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
              }`}
            >
              {l.label} ({count})
            </button>
          );
        })}
      </div>

      {list.length > 1 && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[11px] text-slate-500 mr-1">Question</span>
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`focus-ring h-6 w-6 rounded-md text-[11px] font-mono transition-colors ${
                index === i
                  ? "bg-flame-gold text-ink"
                  : "border border-ink-border text-slate-400 hover:bg-ink-soft"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {q && (
        <div className="surface-2 rounded-lg p-4">
          <p className="text-sm mb-3">{q.question}</p>
          <div className="flex flex-col gap-1.5 mb-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectChoice(i)}
                disabled={revealed}
                className={`focus-ring w-full text-left text-sm rounded-md px-3 py-1.5 border transition-colors ${
                  revealed && i === q.answer
                    ? "border-flame-copper text-flame-copper bg-flame-copper/10"
                    : revealed && i === choice
                    ? "border-flame-crimson text-flame-crimson bg-flame-crimson/10"
                    : "border-ink-border hover:bg-ink-soft"
                }`}
              >
                <span className="font-mono text-xs text-slate-500 mr-2">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
          {!revealed && (
            <button
              onClick={() => setRevealed(true)}
              className="focus-ring rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors mb-2"
            >
              Show answer
            </button>
          )}
          {revealed && (
            <>
              <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-flame-gold pl-3 mb-3">
                {q.explanation}
              </p>
              {index < list.length - 1 ? (
                <button
                  onClick={() => goTo(index + 1)}
                  className="focus-ring rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors"
                >
                  Next question →
                </button>
              ) : (
                (() => {
                  const li = LEVELS.findIndex((l) => l.key === level);
                  const nextLevel = LEVELS[li + 1];
                  return nextLevel ? (
                    <button
                      onClick={() => {
                        setLevel(nextLevel.key);
                        setIndex(0);
                        reset();
                      }}
                      className="focus-ring rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors"
                    >
                      Next level: {nextLevel.label} →
                    </button>
                  ) : (
                    <span className="text-xs text-flame-copper">You have finished every level in this chapter.</span>
                  );
                })()
              )}
            </>
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

          {note.extended_notes && note.extended_notes.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                In-depth explanation
              </div>
              <div className="space-y-3">
                {note.extended_notes.map((sec, i) => (
                  <div key={i} className="border-l-2 border-flame-gold pl-3">
                    <div className="text-sm font-medium mb-0.5">{sec.heading}</div>
                    <p className="text-sm leading-relaxed text-slate-300">{sec.text}</p>
                  </div>
                ))}
              </div>
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

          <PracticeQuestions noteId={note.id} classLevel={note.class_level} chapter={note.chapter} />

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

