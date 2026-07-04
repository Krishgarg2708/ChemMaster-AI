"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/UI";
import notesData from "@/lib/data/notes.json";
import allQuestions from "@/lib/data/questions.json";
import reactionsData from "@/lib/data/named_reactions.json";

const STOPWORDS = new Set([
  "the", "is", "are", "a", "an", "of", "to", "in", "and", "or", "what", "why",
  "how", "does", "do", "explain", "define", "for", "on", "with", "it", "why",
  "when", "which", "can", "you", "me", "please", "i", "my", "this", "that",
  "was", "were", "be", "as", "at", "by", "from",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Build a lightweight retrieval index across notes, practice-question
// explanations, and named reactions. Pure keyword/term-overlap scoring -
// this runs entirely in the browser with no API key and no network call.
function buildCorpus() {
  const docs = [];

  for (const n of notesData) {
    const sections = [
      { label: "Detailed notes", text: n.detailed_notes },
      { label: "Key concepts", text: (n.key_concepts || []).join(". ") },
      { label: "Key formulae", text: (n.key_formulae || []).join(". ") },
      { label: "Memory tricks", text: (n.short_tricks || []).join(". ") },
    ];
    for (const s of sections) {
      if (!s.text) continue;
      docs.push({
        source: `${n.chapter} (${n.class_level}) — ${s.label}`,
        text: s.text,
        tokens: tokenize(s.text),
        href: n.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12",
      });
    }
  }

  for (const entry of allQuestions) {
    for (const lvl of Object.keys(entry.questions)) {
      const q = entry.questions[lvl];
      const text = `${q.question} ${q.explanation}`;
      docs.push({
        source: `${entry.chapter} — practice question (${lvl.replace("_", " ")})`,
        text: q.explanation,
        tokens: tokenize(text),
        href: entry.class_level === "Class 11" ? "/notes/class-11" : "/notes/class-12",
      });
    }
  }

  for (const r of reactionsData) {
    const text = `${r.name} ${r.summary} ${r.reagents_conditions} ${r.example}`;
    docs.push({
      source: `Named reaction — ${r.name}`,
      text: `${r.summary} Reagents: ${r.reagents_conditions}. Example: ${r.example}`,
      tokens: tokenize(text),
      href: "/named-reactions",
    });
  }

  return docs;
}

const CORPUS = buildCorpus();

function search(query, topK = 3) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qSet = new Set(qTokens);

  const scored = CORPUS.map((doc) => {
    let score = 0;
    const docSet = new Set(doc.tokens);
    for (const t of qSet) {
      if (docSet.has(t)) score += 1;
    }
    // small bonus for exact phrase containment
    if (score > 0 && doc.text.toLowerCase().includes(query.toLowerCase().slice(0, 30))) {
      score += 1;
    }
    return { doc, score };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function answerFor(query) {
  const hits = search(query, 3);
  if (hits.length === 0) {
    return {
      text:
        "I couldn't find a close match in your notes, practice-question explanations, or the named reactions index for that. Try rephrasing with the specific term (e.g. a reaction name, chapter topic, or formula), or browse the relevant chapter directly.",
      sources: [],
    };
  }
  const top = hits[0].doc;
  const rest = hits.slice(1);
  return {
    text: top.text,
    sources: [top, ...rest.map((h) => h.doc)],
  };
}

export default function DoubtSolver() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Paste a doubt or topic and I'll search your notes, practice-question explanations, and the named-reactions index for the closest match. This runs fully offline (no API key) - it's retrieval over your own content, not a generative model, so answers are drawn verbatim from your data rather than freshly written.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const { text, sources } = answerFor(q);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "bot", text, sources }]);
    setInput("");
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Doubt Solver · Offline, notes-powered"
        title="AI Doubt Solver"
        description="A retrieval-based doubt solver that searches your own notes, formulae, memory tricks, and named reactions for the closest explanation - works fully offline with no API key required."
      />

      <Card className="!p-0 overflow-hidden">
        <div className="max-h-[28rem] overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-flame-gold text-ink"
                    : "surface-2"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-ink-border/60 flex flex-wrap gap-1.5">
                    {m.sources.map((s, si) => (
                      <span key={si} className="text-[10px] font-mono text-flame-gold/80">
                        [{s.source}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-ink-border p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="e.g. Why is phenol more acidic than ethanol?"
            className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent flex-1"
          />
          <button
            onClick={send}
            className="focus-ring rounded-lg bg-flame-gold text-ink font-medium px-5 py-2.5 text-sm"
          >
            Ask
          </button>
        </div>
      </Card>
    </div>
  );
}
