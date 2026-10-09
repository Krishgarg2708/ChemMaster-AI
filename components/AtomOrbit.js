"use client";

// Electrons per principal shell, parsed from the element's own
// electronic_configuration string (e.g. "[Ar]3d5 4s1" -> [2, 8, 13, 1]).
const CORES = {
  He: [2],
  Ne: [2, 8],
  Ar: [2, 8, 8],
  Kr: [2, 8, 18, 8],
  Xe: [2, 8, 18, 18, 8],
  Rn: [2, 8, 18, 32, 18, 8],
};

export function shellsFromConfig(config = "") {
  const core = config.match(/^\[(\w+)\]/);
  const shells = core && CORES[core[1]] ? [...CORES[core[1]]] : [];
  const re = /(\d)[spdf](\d+)/g;
  let m;
  while ((m = re.exec(config.replace(/^\[\w+\]/, "")))) {
    const n = Number(m[1]);
    shells[n - 1] = (shells[n - 1] || 0) + Number(m[2]);
  }
  return shells.map((x) => x || 0);
}

export default function AtomOrbit({ element, color = "#FFD84D", size = 320, className = "" }) {
  if (!element) return null;
  const shells = shellsFromConfig(element.electronic_configuration);
  const c = size / 2;
  const first = size * 0.15;
  const step = (c - first - 8) / Math.max(shells.length, 1);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`${element.name} has ${shells.join(", ")} electrons per shell`}
    >
      <defs>
        <radialGradient id={`nuc-${element.atomic_number}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="55%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={c} cy={c} r={first * 1.6} fill={`url(#nuc-${element.atomic_number})`} className="nucleus-glow" />
      <text
        x={c}
        y={c + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Bricolage Grotesque', sans-serif"
        fontWeight="700"
        fontSize={first * 0.9}
        fill="#fff"
      >
        {element.symbol}
      </text>

      {shells.map((count, i) => {
        const r = first + step * (i + 1) - step * 0.35;
        const dur = 14 + i * 7;
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity="0.22" strokeDasharray="2 5" />
            <g className={`shell-spin ${i % 2 ? "rev" : ""}`} style={{ "--dur": `${dur}s` }}>
              {Array.from({ length: count }).map((_, k) => {
                const a = (k / count) * Math.PI * 2 + i * 0.6;
                return (
                  <circle
                    key={k}
                    cx={c + r * Math.cos(a)}
                    cy={c + r * Math.sin(a)}
                    r={count > 20 ? 2.2 : 3}
                    fill={color}
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                  />
                );
              })}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
