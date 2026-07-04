"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card } from "@/components/UI";

function NumberInput({ label, value, onChange, placeholder, suffix }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">{label}</div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="focus-ring surface-2 rounded-lg px-3 py-2 text-sm bg-transparent w-full"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function MolarityCalculator() {
  const [mass, setMass] = useState("");
  const [molarMass, setMolarMass] = useState("");
  const [volume, setVolume] = useState("");
  const [solventMass, setSolventMass] = useState("");

  const moles = mass && molarMass ? Number(mass) / Number(molarMass) : null;
  const molarity = moles != null && volume ? moles / (Number(volume) / 1000) : null;
  const molality = moles != null && solventMass ? moles / (Number(solventMass) / 1000) : null;

  return (
    <Card>
      <div className="eyebrow mb-1">Molarity / Molality Converter</div>
      <p className="text-xs text-slate-500 mb-4">
        Enter mass of solute and molar mass to get moles, then volume (for molarity) and/or solvent
        mass (for molality).
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <NumberInput label="Mass of solute" value={mass} onChange={setMass} suffix="g" placeholder="e.g. 5.85" />
        <NumberInput label="Molar mass" value={molarMass} onChange={setMolarMass} suffix="g/mol" placeholder="e.g. 58.5 (NaCl)" />
        <NumberInput label="Volume of solution" value={volume} onChange={setVolume} suffix="mL" placeholder="e.g. 500" />
        <NumberInput label="Mass of solvent" value={solventMass} onChange={setSolventMass} suffix="g" placeholder="e.g. 500" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="surface-2 rounded-lg p-3 text-center">
          <div className="text-[11px] text-slate-500">Moles</div>
          <div className="font-mono text-flame-gold text-lg">{moles != null ? moles.toFixed(4) : "–"}</div>
        </div>
        <div className="surface-2 rounded-lg p-3 text-center">
          <div className="text-[11px] text-slate-500">Molarity (M)</div>
          <div className="font-mono text-flame-copper text-lg">{molarity != null ? molarity.toFixed(4) : "–"}</div>
        </div>
        <div className="surface-2 rounded-lg p-3 text-center">
          <div className="text-[11px] text-slate-500">Molality (m)</div>
          <div className="font-mono text-flame-violet text-lg">{molality != null ? molality.toFixed(4) : "–"}</div>
        </div>
      </div>
    </Card>
  );
}

function EmpiricalFormulaFinder() {
  const [rows, setRows] = useState([
    { element: "C", mass: "" },
    { element: "H", mass: "" },
    { element: "O", mass: "" },
  ]);

  // Approximate standard atomic masses for common elements
  const ATOMIC_MASS = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.990, Mg: 24.305,
    Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098,
    Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.868,
    I: 126.904, Ba: 137.327, Pb: 207.2,
  };

  const updateRow = (i, field, val) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  };

  const addRow = () => setRows((r) => [...r, { element: "", mass: "" }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const result = useMemo(() => {
    const valid = rows.filter((r) => r.element && r.mass && ATOMIC_MASS[r.element]);
    if (valid.length < 2) return null;
    const molesArr = valid.map((r) => ({
      element: r.element,
      moles: Number(r.mass) / ATOMIC_MASS[r.element],
    }));
    const minMoles = Math.min(...molesArr.map((m) => m.moles));
    let ratios = molesArr.map((m) => ({ element: m.element, ratio: m.moles / minMoles }));

    // try scaling by small integers to clear common non-integer ratios like .5, .33
    for (const scale of [1, 2, 3, 4]) {
      const scaled = ratios.map((r) => r.ratio * scale);
      if (scaled.every((v) => Math.abs(v - Math.round(v)) < 0.08)) {
        ratios = ratios.map((r, i) => ({ element: r.element, ratio: Math.round(scaled[i]) }));
        break;
      }
    }

    const formula = ratios.map((r) => `${r.element}${r.ratio === 1 ? "" : r.ratio}`).join("");
    return { ratios, formula };
  }, [rows]);

  return (
    <Card>
      <div className="eyebrow mb-1">Empirical Formula Finder</div>
      <p className="text-xs text-slate-500 mb-4">
        Enter each element's symbol and its mass (or mass %) in the compound; the tool converts to
        moles and finds the simplest whole-number ratio.
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={row.element}
              onChange={(e) => updateRow(i, "element", e.target.value.trim())}
              placeholder="Symbol (e.g. C)"
              className="focus-ring surface-2 rounded-lg px-3 py-2 text-sm bg-transparent w-28"
            />
            <input
              type="number"
              value={row.mass}
              onChange={(e) => updateRow(i, "mass", e.target.value)}
              placeholder="Mass / mass %"
              className="focus-ring surface-2 rounded-lg px-3 py-2 text-sm bg-transparent flex-1"
            />
            <button
              onClick={() => removeRow(i)}
              className="focus-ring text-slate-500 hover:text-flame-crimson px-2 text-sm"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addRow}
          className="focus-ring self-start rounded-lg border border-ink-border px-3 py-1.5 text-xs hover:bg-ink-soft transition-colors"
        >
          + Add element
        </button>
      </div>

      {result ? (
        <div className="surface-2 rounded-lg p-4">
          <div className="text-[11px] text-slate-500 mb-2">Mole ratio</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {result.ratios.map((r) => (
              <span key={r.element} className="chip">{r.element}: {r.ratio}</span>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mb-1">Empirical formula</div>
          <div className="font-mono text-2xl text-flame-gold">{result.formula}</div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Enter at least two known elements with masses to compute a ratio.</p>
      )}
      <p className="text-[10px] text-slate-600 mt-3">
        Supported elements: {Object.keys(ATOMIC_MASS).join(", ")}
      </p>
    </Card>
  );
}

function PhCalculator() {
  const [inputType, setInputType] = useState("H+"); // H+ | OH- | pH | pOH
  const [value, setValue] = useState("");

  const result = useMemo(() => {
    const v = Number(value);
    if (!value || Number.isNaN(v)) return null;
    let pH, pOH, hConc, ohConc;
    if (inputType === "H+") {
      hConc = v;
      pH = -Math.log10(hConc);
      pOH = 14 - pH;
      ohConc = Math.pow(10, -pOH);
    } else if (inputType === "OH-") {
      ohConc = v;
      pOH = -Math.log10(ohConc);
      pH = 14 - pOH;
      hConc = Math.pow(10, -pH);
    } else if (inputType === "pH") {
      pH = v;
      pOH = 14 - pH;
      hConc = Math.pow(10, -pH);
      ohConc = Math.pow(10, -pOH);
    } else {
      pOH = v;
      pH = 14 - pOH;
      hConc = Math.pow(10, -pH);
      ohConc = Math.pow(10, -pOH);
    }
    const nature = pH < 7 ? "Acidic" : pH > 7 ? "Basic" : "Neutral";
    return { pH, pOH, hConc, ohConc, nature };
  }, [inputType, value]);

  return (
    <Card>
      <div className="eyebrow mb-1">pH Calculator</div>
      <p className="text-xs text-slate-500 mb-4">
        Enter any one of [H+], [OH-], pH, or pOH (at 25°C, Kw = 10⁻¹⁴) - the rest are derived
        automatically.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {["H+", "OH-", "pH", "pOH"].map((t) => (
          <button
            key={t}
            onClick={() => setInputType(t)}
            className={`focus-ring rounded-full px-3 py-1 text-xs font-mono transition-colors ${
              inputType === t ? "bg-flame-gold text-ink" : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
            }`}
          >
            {t === "H+" ? "[H+]" : t === "OH-" ? "[OH-]" : t}
          </button>
        ))}
      </div>
      <NumberInput
        label={inputType === "H+" || inputType === "OH-" ? `${inputType === "H+" ? "[H+]" : "[OH-]"} (mol/L)` : inputType}
        value={value}
        onChange={setValue}
        placeholder={inputType.includes("p") ? "e.g. 4.7" : "e.g. 0.0001"}
      />
      {result && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="surface-2 rounded-lg p-3">
            <div className="text-[11px] text-slate-500">pH</div>
            <div className="font-mono text-flame-gold text-lg">{result.pH.toFixed(2)}</div>
          </div>
          <div className="surface-2 rounded-lg p-3">
            <div className="text-[11px] text-slate-500">pOH</div>
            <div className="font-mono text-flame-copper text-lg">{result.pOH.toFixed(2)}</div>
          </div>
          <div className="surface-2 rounded-lg p-3">
            <div className="text-[11px] text-slate-500">[H+]</div>
            <div className="font-mono text-flame-azure text-sm">{result.hConc.toExponential(3)} M</div>
          </div>
          <div className="surface-2 rounded-lg p-3">
            <div className="text-[11px] text-slate-500">[OH-]</div>
            <div className="font-mono text-flame-violet text-sm">{result.ohConc.toExponential(3)} M</div>
          </div>
          <div className="surface-2 rounded-lg p-3 sm:col-span-2 text-center">
            <div className="text-[11px] text-slate-500">Nature</div>
            <div className="font-display text-lg">{result.nature}</div>
          </div>
        </div>
      )}
    </Card>
  );
}

const TOOLS = [
  { key: "molarity", label: "Molarity / Molality" },
  { key: "empirical", label: "Empirical Formula" },
  { key: "ph", label: "pH Calculator" },
];

export default function Calculators() {
  const [tool, setTool] = useState("molarity");

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Utilities · Calculator Toolkit"
        title="Chemistry Calculators"
        description="Small, dependable utility widgets for the numericals students redo constantly - all computed locally in your browser, no server round-trip."
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTool(t.key)}
            className={`focus-ring rounded-full px-4 py-1.5 text-sm font-mono transition-colors ${
              tool === t.key ? "bg-flame-gold text-ink" : "border border-ink-border text-slate-400 hover:text-paper hover:bg-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tool === "molarity" && <MolarityCalculator />}
      {tool === "empirical" && <EmpiricalFormulaFinder />}
      {tool === "ph" && <PhCalculator />}
    </div>
  );
}
