"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader, Card } from "@/components/UI";
import { useAppState } from "@/lib/store";
import allQuestions from "@/lib/data/questions.json";
import notesData from "@/lib/data/notes.json";

const LEVELS = ["easy", "medium", "hard", "jee_main", "jee_advanced"];
const SEC_PER_Q = 90; // 1.5 min per question, exam-simulation pacing

function buildTest(classLevel, count) {
  const pool = allQuestions.filter(
    (q) => classLevel === "All" || q.class_level === classLevel
  );
  const flat = [];
  for (const entry of pool) {
    for (const lvl of LEVELS) {
      const q = entry.questions[lvl];
      if (q) {
        flat.push({
          note_id: entry.note_id,
          class_level: entry.class_level,
          chapter: entry.chapter,
          level: lvl,
          ...q,
        });
      }
    }
  }
  // shuffle
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }
  return flat.slice(0, count);
}

function fmtTime(s) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function MockTest() {
  const { addXp, logActivity, logAttempt, recordMockTest } = useAppState();
  const [stage, setStage] = useState("setup"); // setup | running | review
  const [classLevel, setClassLevel] = useState("All");
  const [count, setCount] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const answersRef = useRef({});
  const questionsRef = useRef([]);
  const timeLeftRef = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (stage !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const start = () => {
    const qs = buildTest(classLevel, count);
    setQuestions(qs);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(qs.length * SEC_PER_Q);
    setStage("running");
  };

  const finishTest = () => {
    clearInterval(timerRef.current);
    const finalQuestions = questionsRef.current;
    const finalAnswers = answersRef.current;
    let score = 0;
    finalQuestions.forEach((q, i) => {
      const chosen = finalAnswers[i];
      const correct = chosen === q.answer;
      if (correct) score += 1;
      logAttempt(q.class_level, q.chapter, correct);
    });
    addXp(score * 3);
    logActivity(`Completed a mock test: ${score}/${finalQuestions.length}`);
    recordMockTest({
      score,
      total: finalQuestions.length,
      classLevel,
      durationSec: finalQuestions.length * SEC_PER_Q - timeLeftRef.current,
    });
    setStage("review");
  };

  const score = useMemo(
    () => questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0),
    [questions, answers]
  );

  if (stage === "setup") {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <PageHeader
          eyebrow="Exam Simulation · Mock Test"
          title="Timed Mock Test"
          description="Exam-style simulation pulled from the full question bank: a countdown timer, auto-scoring, and a full review screen at the end - separate from chapter-level practice."
        />
        <Card>
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Class level</div>
            <div className="flex flex-wrap gap-2">
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
          </div>
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
              Number of questions ({count}) — ~{Math.round((count * SEC_PER_Q) / 60)} min
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-flame-gold"
            />
          </div>
          <button
            onClick={start}
            className="focus-ring w-full rounded-lg bg-flame-gold text-ink font-medium px-4 py-3 text-sm"
          >
            Start mock test →
          </button>
        </Card>
      </div>
    );
  }

  if (stage === "running") {
    const q = questions[current];
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-400">
            Question {current + 1} / {questions.length}
          </div>
          <div className={`font-mono text-lg ${timeLeft < 60 ? "text-flame-crimson" : "text-flame-gold"}`}>
            ⏱ {fmtTime(timeLeft)}
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-ink-soft overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-flame-crimson via-flame-gold to-flame-copper transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <Card>
          <div className="text-[11px] text-slate-500 mb-3">{q.chapter} · {q.level.replace("_", " ")}</div>
          <p className="text-base mb-5">{q.question}</p>
          <div className="flex flex-col gap-2 mb-6">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [current]: i }))}
                className={`focus-ring w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  answers[current] === i
                    ? "border-flame-gold bg-ink-soft"
                    : "border-ink-border hover:bg-ink-soft"
                }`}
              >
                <span className="font-mono text-xs text-slate-500 mr-2">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-3">
            <button
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors disabled:opacity-30"
            >
              ← Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={finishTest}
                className="focus-ring rounded-lg bg-flame-gold text-ink font-medium px-5 py-2 text-sm"
              >
                Submit test
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // review
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Mock Test · Review"
        title={`Score: ${score} / ${questions.length}`}
        description={`You scored ${Math.round((score / questions.length) * 100)}%. Review every question below, then retake with a fresh shuffle whenever you like.`}
      />
      <div className="flex flex-col gap-3 mb-8">
        {questions.map((q, i) => {
          const chosen = answers[i];
          const correct = chosen === q.answer;
          return (
            <Card key={i} className={`!p-4 border-l-4 ${correct ? "border-l-flame-copper" : "border-l-flame-crimson"}`}>
              <div className="text-[11px] text-slate-500 mb-1">{q.chapter} · {q.level.replace("_", " ")}</div>
              <p className="text-sm mb-2">{q.question}</p>
              <p className="text-xs mb-1">
                Your answer:{" "}
                <span className={correct ? "text-flame-copper" : "text-flame-crimson"}>
                  {chosen != null ? q.options[chosen] : "Not answered"}
                </span>
              </p>
              {!correct && (
                <p className="text-xs mb-2 text-flame-copper">Correct answer: {q.options[q.answer]}</p>
              )}
              <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-flame-gold pl-3">
                {q.explanation}
              </p>
            </Card>
          );
        })}
      </div>
      <button
        onClick={() => setStage("setup")}
        className="focus-ring rounded-lg bg-flame-gold text-ink font-medium px-5 py-2.5 text-sm"
      >
        Take another mock test
      </button>
    </div>
  );
}
