"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/lib/store";
import { Card } from "@/components/UI";

function pickQuestion(pool) {
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrongCandidates = pool.filter((e) => e.atomic_number !== correct.atomic_number);
  const wrong = [];
  const copy = [...wrongCandidates];
  while (wrong.length < Math.min(3, copy.length)) {
    const i = Math.floor(Math.random() * copy.length);
    wrong.push(copy.splice(i, 1)[0]);
  }
  const options = [...wrong, correct].sort(() => Math.random() - 0.5);
  const types = ["symbol_to_name", "name_to_symbol", "config"];
  const type = types[Math.floor(Math.random() * types.length)];
  return { correct, options, type };
}

export default function QuizMode({ elements }) {
  const { addXp, logActivity } = useAppState();
  const [question, setQuestion] = useState(null);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'

  const pool = elements.length >= 4 ? elements : elements;

  useEffect(() => {
    if (pool.length >= 4) {
      setQuestion(pickQuestion(pool));
      setChoice(null);
      setResult(null);
    }
  }, [elements]);

  if (pool.length < 4) {
    return <p className="text-slate-500">Select at least 4 elements (adjust filters) to start a quiz.</p>;
  }
  if (!question) return null;

  const { correct, options, type } = question;
  const promptText =
    type === "symbol_to_name"
      ? `Which element has the symbol "${correct.symbol}"?`
      : type === "name_to_symbol"
      ? `What is the chemical symbol for "${correct.name}"?`
      : `Which element has the configuration "${correct.electronic_configuration}"?`;

  const labelFor = (el) =>
    type === "symbol_to_name" ? el.name : type === "name_to_symbol" ? el.symbol : `${el.symbol} (${el.name})`;

  const correctLabel = labelFor(correct);

  const submit = () => {
    if (choice === correctLabel) {
      setResult("correct");
      addXp(5);
      logActivity(`Answered a periodic table quiz correctly (${correct.name})`);
    } else {
      setResult("wrong");
    }
  };

  const next = () => {
    setQuestion(pickQuestion(pool));
    setChoice(null);
    setResult(null);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <div className="eyebrow mb-3">Quiz</div>
      <p className="font-display text-lg mb-5">{promptText}</p>

      <div className="space-y-2 mb-5">
        {options.map((o) => {
          const label = labelFor(o);
          const isChoice = choice === label;
          return (
            <button
              key={o.atomic_number}
              disabled={result !== null}
              onClick={() => setChoice(label)}
              className={`focus-ring w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                isChoice
                  ? "border-flame-gold bg-ink-soft"
                  : "border-ink-border hover:bg-ink-soft"
              } ${
                result && label === correctLabel
                  ? "!border-flame-copper"
                  : result === "wrong" && isChoice
                  ? "!border-flame-crimson"
                  : ""
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {result === null ? (
        <button
          disabled={!choice}
          onClick={submit}
          className="focus-ring w-full rounded-lg bg-flame-gold text-ink font-medium px-4 py-2.5 text-sm disabled:opacity-40 transition-opacity"
        >
          Submit answer
        </button>
      ) : (
        <div>
          <p className={`text-sm mb-3 ${result === "correct" ? "text-flame-copper" : "text-flame-crimson"}`}>
            {result === "correct" ? "Correct! +5 XP" : `Not quite — the answer was ${correctLabel}.`}
          </p>
          <button
            onClick={next}
            className="focus-ring w-full rounded-lg border border-ink-border px-4 py-2.5 text-sm hover:bg-ink-soft transition-colors"
          >
            Next question →
          </button>
        </div>
      )}
    </Card>
  );
}
