"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import notesData from "@/lib/data/notes.json";
import elementsData from "@/lib/data/elements.json";
import reactionsData from "@/lib/data/named_reactions.json";
import pyqData from "@/lib/data/pyq.json";

function notesPath(classLevel) {
  return classLevel === "Class 11" ? "/notes/class-11" : "/notes/class-12";
}

function buildIndex() {
  const items = [];

  for (const n of notesData) {
    items.push({
      kind: "Note",
      title: n.chapter,
      subtitle: n.class_level,
      href: notesPath(n.class_level),
      haystack: [n.chapter, ...(n.key_concepts || []), ...(n.key_formulae || [])].join(" ").toLowerCase(),
    });
  }

  for (const e of elementsData) {
    items.push({
      kind: "Element",
      title: `${e.name} (${e.symbol})`,
      subtitle: `Z=${e.atomic_number} · ${e.category}`,
      href: "/periodic-table",
      haystack: [e.name, e.symbol, e.category, String(e.atomic_number)].join(" ").toLowerCase(),
    });
  }

  for (const r of reactionsData) {
    items.push({
      kind: "Reaction",
      title: r.name,
      subtitle: r.category,
      href: "/named-reactions",
      haystack: [r.name, r.category, r.summary, r.reagents_conditions].join(" ").toLowerCase(),
    });
  }

  for (const q of pyqData) {
    items.push({
      kind: "PYQ",
      title: q.question.slice(0, 70) + (q.question.length > 70 ? "…" : ""),
      subtitle: `${q.chapter} · ${q.style}`,
      href: "/pyq-bank",
      haystack: [q.question, q.chapter, q.style].join(" ").toLowerCase(),
    });
  }

  return items;
}

const INDEX = buildIndex();

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (s.length < 2) return [];
    const scored = INDEX.filter((i) => i.haystack.includes(s));
    return scored.slice(0, 18);
  }, [query]);

  const grouped = useMemo(() => {
    const g = {};
    for (const r of results) {
      g[r.kind] = g[r.kind] || [];
      g[r.kind].push(r);
    }
    return g;
  }, [results]);

  return (
    <div ref={boxRef} className="relative w-full max-w-lg">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search notes, elements, reactions, PYQs…"
        className="focus-ring surface-2 rounded-lg pl-9 pr-3 py-2 text-sm bg-transparent w-full"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
        ⌕
      </span>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-30 mt-2 w-full max-h-96 overflow-y-auto surface rounded-xl2 p-2 shadow-card">
          {results.length === 0 && (
            <p className="text-xs text-slate-500 px-3 py-4 text-center">No matches across notes, elements, reactions or PYQs.</p>
          )}
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind} className="mb-2 last:mb-0">
              <div className="text-[10px] uppercase tracking-widest text-flame-gold px-3 py-1">
                {kind}
              </div>
              {items.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring block rounded-lg px-3 py-2 hover:bg-ink-soft transition-colors"
                >
                  <div className="text-sm truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
