"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";
import { Card, Card2, Metric, PageHeader } from "@/components/UI";
import elementsData from "@/lib/data/elements.json";
import notesData from "@/lib/data/notes.json";

const QUOTES = [
  "Chemistry is the study of change - master one reaction at a time.",
  "The most important thing is not to stop questioning. - Albert Einstein",
  "Every mole counts - keep practicing the numericals daily.",
  "Revision today is a higher rank tomorrow.",
  "In chemistry as in life, nothing is wasted if you learn from it.",
  "Small daily gains in accuracy compound into big rank jumps.",
];

function dayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  return Math.floor(diff / 86400000);
}

export default function HomePage() {
  const { state, hydrated, isComplete } = useAppState();
  const [challenge, setChallenge] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const idx = dayIndex();
    setChallenge(elementsData[idx % elementsData.length]);
  }, []);

  const quote = QUOTES[dayIndex() % QUOTES.length];

  const totalChapters = notesData.length;
  const completedCount = useMemo(() => {
    if (!hydrated) return 0;
    return notesData.filter((n) => isComplete(n.class_level, n.chapter)).length;
  }, [hydrated, isComplete]);

  const pending = useMemo(() => {
    if (!hydrated) return [];
    return notesData.filter((n) => !isComplete(n.class_level, n.chapter)).slice(0, 5);
  }, [hydrated, isComplete]);

  const weakTopics = useMemo(() => {
    if (!hydrated) return [];
    return notesData
      .map((n) => {
        const key = `${n.class_level}::${n.chapter}`;
        const a = state.attempts[key];
        if (!a || a.total === 0) return null;
        return { key, chapter: n.chapter, pct: Math.round((a.correct / a.total) * 100) };
      })
      .filter(Boolean)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 4);
  }, [hydrated, state.attempts]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Dashboard · 00"
        title={`Welcome back${hydrated ? `, ${state.name}` : ""}`}
        description="Your revision control panel: streak, progress, and where to pick up next - all stored locally in this browser."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric label="Study Streak" value={hydrated ? `${state.streak}d` : "–"} accent="crimson" />
        <Metric
          label="Chapters Done"
          value={hydrated ? `${completedCount}/${totalChapters}` : "–"}
          accent="copper"
        />
        <Metric label="Total XP" value={hydrated ? state.xp : "–"} accent="gold" />
        <Metric label="Bookmarks" value={hydrated ? state.bookmarks.length : "–"} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <div className="eyebrow">Quote of the day</div>
            <p className="font-display text-xl md:text-2xl leading-snug border-l-2 border-flame-gold pl-4 mt-2">
              {quote}
            </p>
          </Card>

          <Card>
            <div className="eyebrow">Daily challenge</div>
            {challenge && (
              <>
                <p className="mt-2 mb-4">
                  What is the electronic configuration of{" "}
                  <span className="font-mono text-flame-gold">
                    {challenge.name} ({challenge.symbol})
                  </span>
                  ?
                </p>
                {!revealed ? (
                  <button
                    onClick={() => setRevealed(true)}
                    className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
                  >
                    Reveal answer
                  </button>
                ) : (
                  <div className="surface-2 p-4">
                    <div className="font-mono text-flame-copper mb-1">
                      {challenge.electronic_configuration}
                    </div>
                    <p className="text-sm text-slate-400">{challenge.fact}</p>
                  </div>
                )}
              </>
            )}
          </Card>

          <Card>
            <div className="eyebrow mb-3">Recent activity</div>
            {hydrated && state.activity.length > 0 ? (
              <ul className="space-y-3">
                {state.activity.map((a, i) => (
                  <li key={i} className="text-sm flex items-baseline justify-between gap-4">
                    <span>{a.text}</span>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {new Date(a.at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No activity yet - explore the Periodic Table or Notes to get started.
              </p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow">Weak-topic heatmap</div>
              <Link href="/analytics" className="text-xs text-flame-gold hover:opacity-80 transition-opacity">
                Full analytics →
              </Link>
            </div>
            {weakTopics.length > 0 ? (
              <div className="space-y-2.5">
                {weakTopics.map((w) => (
                  <div key={w.key} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-xs truncate">{w.chapter}</div>
                    <div className="flex-1 h-2 rounded-full bg-ink-soft overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-flame-crimson to-flame-gold"
                        style={{ width: `${w.pct}%` }}
                      />
                    </div>
                    <div className="w-12 text-right font-mono text-[11px] text-slate-500">{w.pct}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Answer some practice questions or a mock test to see your weakest chapters here.
              </p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card2>
            <div className="eyebrow mb-3">Suggested next</div>
            {pending.length > 0 ? (
              <ul className="space-y-3">
                {pending.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12"}
                      className="focus-ring block rounded-lg px-3 py-2 -mx-3 hover:bg-ink-soft transition-colors"
                    >
                      <div className="text-sm">{n.chapter}</div>
                      <div className="text-[11px] text-slate-500">{n.class_level}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-flame-copper">All chapters marked complete. 🎉</p>
            )}
          </Card2>

          <Card2>
            <div className="eyebrow mb-3">Quick links</div>
            <div className="flex flex-col gap-2">
              <Link
                href="/periodic-table"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Open Periodic Table →
              </Link>
              <Link
                href="/notes/class-11"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Class 11 Notes →
              </Link>
              <Link
                href="/notes/class-12"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Class 12 Notes →
              </Link>
              <Link
                href="/mock-test"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Start a Mock Test →
              </Link>
              <Link
                href="/doubt-solver"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Ask the Doubt Solver →
              </Link>
              <Link
                href="/certificate"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-soft transition-colors"
              >
                Export Progress Card →
              </Link>
            </div>
          </Card2>

          <Card2>
            <div className="eyebrow mb-3">About this build</div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Next.js + Tailwind, deployable directly on Vercel. Element and
              chapter data is served from API routes; your progress, XP, and
              bookmarks live in this browser's local storage.
            </p>
          </Card2>
        </div>
      </div>
    </div>
  );
}
