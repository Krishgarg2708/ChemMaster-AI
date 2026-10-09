"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";
import { Card, Card2, Metric } from "@/components/UI";
import AtomOrbit from "@/components/AtomOrbit";
import { categoryColor } from "@/lib/categoryColors";
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
      <section className="relative overflow-hidden rounded-[1.6rem] border border-ink-border/80 mb-8 animate-rise"
        style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(255,216,77,.12), transparent 55%), radial-gradient(90% 90% at 0% 100%, rgba(94,230,176,.12), transparent 60%), linear-gradient(180deg, rgba(20,45,37,.85), rgba(8,22,17,.95))" }}>
        <div className="grid md:grid-cols-[1.1fr_1fr] items-center gap-4 p-6 md:p-10">
          <div>
            <p className="text-sm text-flame-gold font-medium mb-3">
              {hydrated && state.streak > 0 ? `${state.streak}-day streak` : "Today's lab"}
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.02] text-paper mb-4">
              Welcome back{hydrated ? `, ${state.name}` : ""}.
            </h1>
            <p className="text-slate-400 max-w-md leading-relaxed mb-6">
              Today's element is below. Work out its electron configuration, then check yourself.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/mock-test" className="focus-ring rounded-xl bg-flame-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 transition">
                Start a mock test
              </Link>
              <Link href="/periodic-table" className="focus-ring rounded-xl border border-ink-border px-5 py-2.5 text-sm text-paper hover:bg-ink-softer/70 transition-colors">
                Open periodic table
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            {challenge && (
              <>
                <AtomOrbit
                  element={challenge}
                  color={categoryColor(challenge.category)}
                  size={340}
                  className="w-full max-w-[340px] h-auto"
                />
                <div className="text-center -mt-2">
                  <div className="font-display text-xl text-paper">
                    {challenge.name} <span className="text-slate-500 font-mono text-sm">Z = {challenge.atomic_number}</span>
                  </div>
                  {!revealed ? (
                    <button onClick={() => setRevealed(true)} className="focus-ring mt-2 rounded-lg border border-ink-border px-4 py-1.5 text-sm hover:bg-ink-softer/70 transition-colors">
                      Reveal its configuration
                    </button>
                  ) : (
                    <div className="mt-2 animate-rise">
                      <div className="font-mono text-flame-copper">{challenge.electronic_configuration}</div>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">{challenge.fact}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric label="Study streak" value={hydrated ? `${state.streak}d` : "–"} accent="crimson" />
        <Metric label="Chapters done" value={hydrated ? `${completedCount}/${totalChapters}` : "–"} accent="copper" />
        <Metric label="Total XP" value={hydrated ? state.xp : "–"} accent="gold" />
        <Metric label="Bookmarks" value={hydrated ? state.bookmarks.length : "–"} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <div className="text-xs text-slate-500 mb-1">Quote of the day</div>
            <p className="font-display text-xl md:text-2xl leading-snug border-l-2 border-flame-gold pl-4 mt-2 text-paper">
              {quote}
            </p>
          </Card>

          <Card>
            <div className="text-sm font-medium text-paper mb-3">Recent activity</div>
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
              <div className="text-sm font-medium text-paper">Weakest chapters</div>
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
            <div className="text-sm font-medium text-paper mb-3">Suggested next</div>
            {pending.length > 0 ? (
              <ul className="space-y-3">
                {pending.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12"}
                      className="focus-ring block rounded-lg px-3 py-2 -mx-3 hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
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
            <div className="text-sm font-medium text-paper mb-3">Quick links</div>
            <div className="flex flex-col gap-2">
              <Link
                href="/periodic-table"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Open Periodic Table →
              </Link>
              <Link
                href="/notes/class-11"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Class 11 Notes →
              </Link>
              <Link
                href="/notes/class-12"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Class 12 Notes →
              </Link>
              <Link
                href="/mock-test"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Start a Mock Test →
              </Link>
              <Link
                href="/doubt-solver"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Ask the Doubt Solver →
              </Link>
              <Link
                href="/certificate"
                className="focus-ring rounded-lg border border-ink-border px-3 py-2.5 text-sm hover:bg-ink-softer/70 hover:border-flame-gold/40 transition-colors"
              >
                Get your certificate →
              </Link>
            </div>
          </Card2>

        </div>
      </div>
    </div>
  );
}
