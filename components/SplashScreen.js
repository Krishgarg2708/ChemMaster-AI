"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STATUS = [
  { at: 0, text: "Preparing the lab…" },
  { at: 18, text: "Loading the periodic table…" },
  { at: 38, text: "Balancing equations…" },
  { at: 58, text: "Warming up your AI tutor…" },
  { at: 78, text: "Arranging notes and questions…" },
  { at: 94, text: "Ready" },
];

const PALETTE = ["#38bdf8", "#3b82f6", "#818cf8", "#a78bfa", "#22d3ee"];

/* ------------------------------------------------------------------ */
/* Drifting molecule network drawn on a canvas behind the logo         */
/* ------------------------------------------------------------------ */
function MoleculeField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let atoms = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(22, Math.min(54, Math.floor((w * h) / 26000)));
      atoms = Array.from({ length: count }, () => {
        const big = Math.random() < 0.18;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: big ? 3.4 + Math.random() * 2.4 : 1.3 + Math.random() * 1.5,
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          ph: Math.random() * Math.PI * 2,
        };
      });
    };

    const LINK = 130;

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        for (let j = i + 1; j < atoms.length; j++) {
          const b = atoms[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(96,165,250,${(1 - d / LINK) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const a of atoms) {
        const pulse = 0.65 + 0.35 * Math.sin(t / 900 + a.ph);
        ctx.globalAlpha = 0.9 * pulse;
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r * 4);
        g.addColorStop(0, a.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (t) => {
      for (const a of atoms) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -20) a.x = w + 20;
        if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20;
        if (a.y > h + 20) a.y = -20;
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    build();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(step);

    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return <canvas ref={canvasRef} className="cm-splash-canvas" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Splash screen                                                       */
/* ------------------------------------------------------------------ */
export default function SplashScreen() {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadedRef = useRef(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setProgress(100);
    setExiting(true);
    window.setTimeout(() => setMounted(false), 900);
  }, []);

  // Track the real page load so the bar never reaches 100% before the app is ready.
  useEffect(() => {
    if (document.readyState === "complete") {
      loadedRef.current = true;
    } else {
      const onLoad = () => (loadedRef.current = true);
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  // Drive the progress bar.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduce ? 900 : 3800;
    const start = performance.now();
    let raf = 0;

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      let p = ease(t) * 100;
      if (!loadedRef.current) p = Math.min(p, 92);
      setProgress(p);
      if (t >= 1 && loadedRef.current) {
        window.setTimeout(finish, 450);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  // Lock page scroll while the splash is up.
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Escape skips the animation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  if (!mounted) return null;

  const pct = Math.min(100, Math.floor(progress));
  let status = STATUS[0].text;
  for (const s of STATUS) if (pct >= s.at) status = s.text;

  return (
    <div
      className={`cm-splash ${exiting ? "cm-splash-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading ChemMaster AI"
    >
      <div className="cm-splash-bg" aria-hidden="true" />
      <div className="cm-splash-grid" aria-hidden="true" />
      <MoleculeField />

      <div className="cm-splash-center">
        <div className="cm-logo-wrap">
          <div className="cm-logo-glow" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="ChemMaster AI — Intelligent chemistry for a brighter tomorrow"
            className="cm-logo"
            width={1672}
            height={941}
            fetchPriority="high"
            draggable={false}
          />
          <div className="cm-logo-shine" aria-hidden="true" />
        </div>

        <div className="cm-loader">
          <div className="cm-tube" aria-hidden="true">
            <div className="cm-liquid" style={{ width: `${progress}%` }}>
              <span className="cm-wave" />
              <span className="cm-bubble cm-b1" />
              <span className="cm-bubble cm-b2" />
              <span className="cm-bubble cm-b3" />
              <span className="cm-bubble cm-b4" />
            </div>
          </div>
          <div className="cm-loader-row">
            <span key={status} className="cm-status">
              {status}
            </span>
            <span className="cm-pct">{pct}%</span>
          </div>
        </div>
      </div>

      <button type="button" className="cm-skip" onClick={finish}>
        Skip
      </button>
    </div>
  );
}
