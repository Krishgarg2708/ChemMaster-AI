"use client";

import { useMemo } from "react";
import { PageHeader, Card, Metric } from "@/components/UI";
import { useAppState } from "@/lib/store";
import notesData from "@/lib/data/notes.json";

function accuracyColor(pct) {
  if (pct == null) return "bg-ink-soft border-ink-border text-slate-600";
  if (pct >= 80) return "bg-flame-copper/20 border-flame-copper text-flame-copper";
  if (pct >= 50) return "bg-flame-gold/20 border-flame-gold text-flame-gold";
  return "bg-flame-crimson/20 border-flame-crimson text-flame-crimson";
}

export default function Analytics() {
  const { state, hydrated } = useAppState();

  const rows = useMemo(() => {
    return notesData
      .map((n) => {
        const key = `${n.class_level}::${n.chapter}`;
        const a = state.attempts[key];
        const pct = a && a.total > 0 ? Math.round((a.correct / a.total) * 100) : null;
        return { ...n, attempts: a || { correct: 0, total: 0 }, pct };
      })
      .sort((a, b) => {
        if (a.pct == null && b.pct == null) return 0;
        if (a.pct == null) return 1;
        if (b.pct == null) return -1;
        return a.pct - b.pct;
      });
  }, [state.attempts]);

  const attempted = rows.filter((r) => r.pct != null);
  const weakest = attempted.slice(0, 5);
  const totalAttempts = attempted.reduce((acc, r) => acc + r.attempts.total, 0);
  const totalCorrect = attempted.reduce((acc, r) => acc + r.attempts.correct, 0);
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Insights · Weak-Topic Analytics"
        title="Where you're losing marks"
        description="Accuracy is logged automatically every time you answer a practice question, PYQ, or mock test question - use this heatmap to find chapters that need another pass."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric label="Chapters attempted" value={hydrated ? `${attempted.length}/${notesData.length}` : "–"} accent="gold" />
        <Metric label="Total questions answered" value={hydrated ? totalAttempts : "–"} accent="azure" />
        <Metric label="Overall accuracy" value={hydrated ? `${overallPct}%` : "–"} accent="copper" />
        <Metric label="Mock tests taken" value={hydrated ? state.mockTests.length : "–"} accent="violet" />
      </div>

      <Card className="mb-8">
        <div className="eyebrow mb-3">Weakest chapters right now</div>
        {weakest.length === 0 ? (
          <p className="text-sm text-slate-500">
            No practice data yet — answer some practice questions, PYQs, or a mock test to populate this.
          </p>
        ) : (
          <div className="space-y-3">
            {weakest.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-48 shrink-0 text-sm truncate">{r.chapter}</div>
                <div className="flex-1 h-2 rounded-full bg-ink-soft overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-flame-crimson to-flame-gold"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <div className="w-16 text-right font-mono text-xs text-slate-400">
                  {r.pct}% ({r.attempts.correct}/{r.attempts.total})
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="eyebrow mb-3">Full chapter heatmap</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border px-3 py-2.5 text-xs ${accuracyColor(r.pct)}`}
            title={`${r.attempts.correct}/${r.attempts.total} correct`}
          >
            <div className="truncate font-medium">{r.chapter}</div>
            <div className="opacity-80 mt-0.5">
              {r.pct == null ? "Not attempted" : `${r.pct}% accuracy · ${r.attempts.total} answered`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
