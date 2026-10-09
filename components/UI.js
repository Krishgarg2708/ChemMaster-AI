export function Card({ children, className = "" }) {
  return <div className={`surface p-6 ${className}`}>{children}</div>;
}

export function Card2({ children, className = "" }) {
  return <div className={`surface-2 p-5 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }) {
  return <div className="eyebrow mb-2">{children}</div>;
}

const ACCENTS = {
  gold: { text: "text-flame-gold", hex: "#FFB547" },
  crimson: { text: "text-flame-crimson", hex: "#FF5C6C" },
  copper: { text: "text-flame-copper", hex: "#2DD4A7" },
  violet: { text: "text-flame-violet", hex: "#A58BFF" },
  azure: { text: "text-flame-azure", hex: "#5AAEFF" },
};

export function Metric({ label, value, accent = "gold" }) {
  const a = ACCENTS[accent] || ACCENTS.gold;
  return (
    <div className="surface !p-5 overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${a.hex}, transparent)` }}
      />
      <div className="text-xs text-slate-500 mb-1.5">{label}</div>
      <div className={`font-display text-4xl font-semibold tabular-nums ${a.text}`}>{value}</div>
    </div>
  );
}

export function Chip({ children, tone = "azure" }) {
  const toneMap = {
    azure: "text-flame-azure",
    gold: "text-flame-gold",
    crimson: "text-flame-crimson",
    copper: "text-flame-copper",
    violet: "text-flame-violet",
  };
  return <span className={`chip ${toneMap[tone]}`}>{children}</span>;
}

// `eyebrow` is still accepted so existing pages keep working, but the
// header now leads with the title alone.
export function PageHeader({ title, description }) {
  return (
    <div className="mb-10 animate-rise">
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-paper">
        {title}
      </h1>
      {description && <p className="text-slate-400 max-w-2xl text-[15px] leading-relaxed">{description}</p>}
    </div>
  );
}
