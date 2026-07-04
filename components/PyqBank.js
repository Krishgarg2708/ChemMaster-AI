"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card, Chip } from "@/components/UI";
import { useAppState } from "@/lib/store";
import pyqData from "@/lib/data/pyq.json";
import notesData from "@/lib/data/notes.json";

const chapters = [...new Set(pyqData.map((q) => q.chapter))];

export default function PyqBank() {
  const [classLevel, setClassLevel] = useState("All");
  const [chapter, setChapter] = useState("");
  const [style, setStyle] = useState("All");
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState({});
  const { toggleBookmark, isBookmarked, addXp, logAttempt } = useAppState();

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return pyqData.filter((q) => {
      if (classLevel !== "All" && q.class_level !== classLevel) return false;
      if (chapter && q.chapter !== chapter) return false;
      if (style !== "All" && q.style !== style) return false;
      if (s && !q.question.toLowerCase().includes(s) && !q.chapter.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [classLevel, chapter, style, search]);

  const select = (qid, i, q) => {
    if (revealed[qid]) return;
    setRevealed((r) => ({ ...r, [qid]: i }));
    const correct = i === q.answer;
    logAttempt(q.class_level, q.chapter, correct);
    if (correct) addXp(3);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="PYQ Bank"
        title="JEE-style Previous-Year Question Bank"
        description="An original bank of questions written to match the format, depth, and difficulty of real JEE Main & Advanced papers, tagged by chapter. These are practice-style questions modelled on past papers, not verbatim reproductions of a specific year's paper."
      />

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions or chapters…"
          className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent flex-1"
        />
        <select
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent md:w-40"
        >
          {["All", "Class 11", "Class 12"].map((c) => (
            <option key={c} value={c} className="bg-ink-soft">{c}</option>
          ))}
        </select>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent md:w-48"
        >
          {["All", "JEE Main", "JEE Advanced"].map((c) => (
            <option key={c} value={c} className="bg-ink-soft">{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setChapter("")}
          className={`focus-ring rounded-full px-3 py-1 text-[11px] font-mono transition-colors ${
            !chapter ? "bg-flame-gold text-ink" : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
          }`}
        >
          All chapters
        </button>
        {chapters.map((c) => (
          <button
            key={c}
            onClick={() => setChapter(c)}
            className={`focus-ring rounded-full px-3 py-1 text-[11px] font-mono transition-colors ${
              chapter === c ? "bg-flame-gold text-ink" : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((q) => {
          const chosen = revealed[q.id];
          const bookmarked = isBookmarked("pyq", q.id);
          return (
            <Card key={q.id} className="!p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-[11px] text-slate-500">{q.chapter} · {q.class_level}</div>
                <Chip tone={q.style === "JEE Advanced" ? "violet" : "azure"}>{q.style}</Chip>
              </div>
              <p className="text-sm mb-3">{q.question}</p>
              <div className="flex flex-col gap-1.5 mb-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => select(q.id, i, q)}
                    disabled={chosen != null}
                    className={`focus-ring w-full text-left text-sm rounded-md px-3 py-1.5 border transition-colors ${
                      chosen != null && i === q.answer
                        ? "border-flame-copper text-flame-copper bg-flame-copper/10"
                        : chosen === i
                        ? "border-flame-crimson text-flame-crimson bg-flame-crimson/10"
                        : "border-ink-border hover:bg-ink-soft"
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-500 mr-2">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>
              {chosen != null && (
                <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-flame-gold pl-3 mb-2">
                  {q.explanation}
                </p>
              )}
              <button
                onClick={() => toggleBookmark("pyq", q.id)}
                className="focus-ring text-xs text-flame-gold hover:opacity-80 transition-opacity"
              >
                {bookmarked ? "★ Saved" : "☆ Save question"}
              </button>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-slate-500 text-sm">No questions match your filters.</p>}
      </div>
    </div>
  );
}
