"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, Card } from "@/components/UI";
import elementsData from "@/lib/data/elements.json";
import trendsData from "@/lib/data/element_trends.json";

const trendsByNumber = Object.fromEntries(trendsData.map((t) => [t.atomic_number, t]));

const PROPERTIES = [
  { key: "atomic_radius_pm", label: "Atomic radius (pm)", color: "#3E7CB1" },
  { key: "ionization_energy_kj_mol", label: "1st ionisation energy (kJ/mol)", color: "#E3A72E" },
  { key: "electronegativity_pauling", label: "Electronegativity (Pauling)", color: "#7C4DAA" },
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const GROUPS = Array.from({ length: 18 }, (_, i) => i + 1);

export default function PeriodicTrends() {
  const [mode, setMode] = useState("period"); // period | group
  const [value, setValue] = useState(2);
  const [property, setProperty] = useState("atomic_radius_pm");

  const data = useMemo(() => {
    const els = elementsData.filter((e) =>
      mode === "period" ? e.period === value : e.group === value
    );
    const sorted = [...els].sort((a, b) =>
      mode === "period" ? a.group - b.group : a.period - b.period
    );
    return sorted
      .map((e) => {
        const t = trendsByNumber[e.atomic_number] || {};
        return {
          label: e.symbol,
          name: e.name,
          x: mode === "period" ? e.group : e.period,
          value: t[property],
        };
      })
      .filter((d) => d.value != null);
  }, [mode, value, property]);

  const prop = PROPERTIES.find((p) => p.key === property);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Reference · Periodic Trends"
        title="Interactive Periodic Trends"
        description="Plot atomic radius, ionisation energy, or electronegativity across a period or a group to see the trend visually - reuses the same element dataset as the periodic table."
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">View across</div>
            <div className="flex gap-1.5">
              {["period", "group"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setValue(m === "period" ? 2 : 1);
                  }}
                  className={`focus-ring rounded-full px-4 py-1.5 text-sm font-mono capitalize transition-colors ${
                    mode === m ? "bg-flame-gold text-ink" : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
              {mode === "period" ? "Period" : "Group"}
            </div>
            <select
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="focus-ring surface-2 rounded-lg px-4 py-2 text-sm bg-transparent"
            >
              {(mode === "period" ? PERIODS : GROUPS).map((n) => (
                <option key={n} value={n} className="bg-ink-soft">
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Property</div>
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              className="focus-ring surface-2 rounded-lg px-4 py-2 text-sm bg-transparent"
            >
              {PROPERTIES.map((p) => (
                <option key={p.key} value={p.key} className="bg-ink-soft">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {data.length > 1 ? (
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1B2438", border: "1px solid #26304A", borderRadius: 8 }}
                  labelStyle={{ color: "#F6F3EC" }}
                  formatter={(v) => [v, prop.label]}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.name || l}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={prop.label}
                  stroke={prop.color}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-10 text-center">
            Not enough data points for this selection - try another period/group or property.
          </p>
        )}
      </Card>

      <p className="text-xs text-slate-500 leading-relaxed">
        Atomic radius values are empirical/approximate reference figures (pm) intended for trend
        visualisation. Electronegativity (Pauling scale) and ionisation energy values are sourced
        from a public periodic-table dataset.
      </p>
    </div>
  );
}
