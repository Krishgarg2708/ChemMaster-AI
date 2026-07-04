"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card, Chip } from "@/components/UI";
import { useAppState } from "@/lib/store";
import reactions from "@/lib/data/named_reactions.json";
import notesData from "@/lib/data/notes.json";

const chapterById = Object.fromEntries(notesData.map((n) => [n.id, n.chapter]));

export default function NamedReactionsIndex() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openId, setOpenId] = useState(null);
  const { isBookmarked, toggleBookmark } = useAppState();

  const categories = useMemo(() => [...new Set(reactions.map((r) => r.category))].sort(), []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return reactions.filter((r) => {
      const matchesSearch =
        !s ||
        r.name.toLowerCase().includes(s) ||
        r.summary.toLowerCase().includes(s) ||
        r.chapter_ids.some((id) => (chapterById[id] || "").toLowerCase().includes(s));
      const matchesCategory = !category || r.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Organic Chemistry · Named Reactions"
        title="Named Reactions Index"
        description="Searchable index of the named reactions students most often lose marks on - reagents, mechanism summary, a worked example, and a one-line memory trick for each."
      />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, reagent, or chapter…"
          className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="focus-ring surface-2 rounded-lg px-4 py-2.5 text-sm bg-transparent md:w-72"
        >
          <option value="" className="bg-ink-soft">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c} className="bg-ink-soft">{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((r) => {
          const open = openId === r.id;
          const bookmarked = isBookmarked("reaction", r.id);
          return (
            <Card key={r.id} className="!p-0 overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="focus-ring w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate">{r.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.chapter_ids.map((id) => chapterById[id]).join(" · ")}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Chip tone="violet">{r.category}</Chip>
                  <span className="text-slate-500 text-sm">{open ? "−" : "+"}</span>
                </div>
              </button>

              {open && (
                <div className="px-6 pb-6 border-t border-ink-border pt-4 space-y-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Reagents / conditions</div>
                    <code className="surface-2 px-3 py-1.5 rounded-md text-xs font-mono inline-block">
                      {r.reagents_conditions}
                    </code>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">What happens</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{r.summary}</p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Example</div>
                    <code className="surface-2 px-3 py-2 rounded-md text-xs font-mono block whitespace-pre-wrap">
                      {r.example}
                    </code>
                  </div>
                  <div className="rounded-md border-l-2 border-flame-violet bg-ink-soft/60 pl-3 pr-3 py-2 text-sm">
                    {r.memory_trick}
                  </div>
                  <button
                    onClick={() => toggleBookmark("reaction", r.id)}
                    className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
                  >
                    {bookmarked ? "★ Remove bookmark" : "☆ Bookmark reaction"}
                  </button>
                </div>
              )}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm">No reactions match your search.</p>
        )}
      </div>
    </div>
  );
}
