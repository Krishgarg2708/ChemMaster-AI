export function Card({ children, className = "" }) {
  return <div className={`surface p-6 ${className}`}>{children}</div>;
}

export function Card2({ children, className = "" }) {
  return <div className={`surface-2 p-5 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }) {
  return <div className="eyebrow mb-2">{children}</div>;
}

export function Metric({ label, value, accent = "gold" }) {
  const colorMap = {
    gold: "text-flame-gold",
    crimson: "text-flame-crimson",
    copper: "text-flame-copper",
    violet: "text-flame-violet",
    azure: "text-flame-azure",
  };
  return (
    <Card className="!p-5">
      <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`font-display text-3xl font-semibold ${colorMap[accent]}`}>{value}</div>
    </Card>
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

export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">
        {title}
      </h1>
      {description && <p className="text-slate-400 max-w-2xl">{description}</p>}
    </div>
  );
}
