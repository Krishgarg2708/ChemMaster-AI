"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/store";

const NAV_GROUPS = [
  {
    label: null,
    items: [{ href: "/", label: "Dashboard", mark: "00" }],
  },
  {
    label: "Reference",
    items: [
      { href: "/periodic-table", label: "Periodic Table", mark: "01" },
      { href: "/periodic-trends", label: "Periodic Trends", mark: "02" },
      { href: "/named-reactions", label: "Named Reactions", mark: "03" },
    ],
  },
  {
    label: "Study",
    items: [
      { href: "/notes/class-11", label: "Class 11 Notes", mark: "04" },
      { href: "/notes/class-12", label: "Class 12 Notes", mark: "05" },
      { href: "/formula-sheet", label: "Formula Sheet", mark: "06" },
      { href: "/doubt-solver", label: "Doubt Solver", mark: "07" },
      { href: "/calculators", label: "Calculators", mark: "08" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/mock-test", label: "Mock Test", mark: "09" },
      { href: "/pyq-bank", label: "PYQ Bank", mark: "10" },
      { href: "/analytics", label: "Analytics", mark: "11" },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/bookmarks", label: "Bookmarks", mark: "12" },
      { href: "/certificate", label: "Progress Card", mark: "13" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, hydrated, toggleTheme } = useAppState();

  return (
    <aside className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-ink-border bg-ink lg:min-h-screen lg:sticky lg:top-0">
      <div className="p-6 flex flex-col h-full">
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-flame-crimson via-flame-gold to-flame-copper flex items-center justify-center font-mono text-[13px] font-bold text-ink">
            Cm
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-paper">
            ChemMaster<span className="text-flame-gold">.</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-4 mb-8 overflow-y-auto lg:max-h-[calc(100vh-260px)] pr-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              {group.label && (
                <div className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-0.5 mt-1">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-ring ${
                      active
                        ? "bg-ink-softer text-paper"
                        : "text-slate-400 hover:text-paper hover:bg-ink-soft"
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] w-6 ${
                        active ? "text-flame-gold" : "text-slate-600 group-hover:text-flame-gold"
                      }`}
                    >
                      {item.mark}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="surface-2 p-4 mb-4">
          <div className="eyebrow mb-2">Student</div>
          <div className="font-display text-paper text-base mb-3">
            {hydrated ? state.name : "…"}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-mono text-lg text-flame-gold">{hydrated ? state.streak : "–"}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Streak</div>
            </div>
            <div>
              <div className="font-mono text-lg text-flame-copper">{hydrated ? state.xp : "–"}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">XP</div>
            </div>
            <div>
              <div className="font-mono text-lg text-flame-violet">{hydrated ? state.bookmarks.length : "–"}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Saved</div>
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="focus-ring flex items-center justify-between rounded-lg border border-ink-border px-3 py-2.5 text-sm text-slate-300 hover:text-paper hover:bg-ink-soft transition-colors mt-auto"
        >
          <span>{hydrated && state.theme === "light" ? "Light mode" : "Dark mode"}</span>
          <span className="font-mono text-xs text-flame-gold">
            {hydrated && state.theme === "light" ? "☀" : "☾"}
          </span>
        </button>
        <p className="text-[11px] text-slate-600 mt-4 leading-relaxed">
          Static data, local-first state. No API keys, no server database.
        </p>
      </div>
    </aside>
  );
}
