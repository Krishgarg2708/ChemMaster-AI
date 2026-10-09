"use client";

import { useEffect, useRef } from "react";

// A quiet "reaction chamber" behind the whole app:
//  - atoms drift, and bond (a line appears) when they pass close together
//  - the cursor gently pushes atoms away, like stirring a solution
//  - bubbles rise from the bottom and wobble
//  - faint formulas float by (H2O, NaCl, CO2 ...)
// It pauses when the tab is hidden and draws one still frame when the
// visitor prefers reduced motion.
const FORMULAS = ["H₂O", "NaCl", "CO₂", "C₆H₆", "CH₄", "NH₃", "H₂SO₄", "HCl", "O₂", "Fe₂O₃", "C₂H₅OH", "NaOH"];
const DARK = { atom: [94, 230, 176], bond: [108, 196, 255], bubble: [200, 240, 255], text: [255, 216, 77], a: 1 };
const LIGHT = { atom: [20, 140, 100], bond: [50, 120, 200], bubble: [40, 120, 190], text: [150, 110, 0], a: 0.8 };

export default function LiveBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0;
    let atoms = [], bubbles = [], labels = [];
    const mouse = { x: -999, y: -999 };

    const rnd = (a, b) => a + Math.random() * (b - a);

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(24, Math.min(70, Math.floor((w * h) / 24000)));
      atoms = Array.from({ length: n }, () => ({
        x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.18, 0.18), vy: rnd(-0.18, 0.18), r: rnd(1.4, 3.2),
      }));
      bubbles = Array.from({ length: Math.floor(w / 70) + 6 }, () => newBubble(true));
      labels = Array.from({ length: Math.max(5, Math.floor(w / 220)) }, () => newLabel(true));
    };

    function newBubble(anywhere) {
      return { x: rnd(0, w), y: anywhere ? rnd(0, h) : h + 20, r: rnd(2, 9), v: rnd(0.25, 0.8), ph: rnd(0, 6.28), sw: rnd(8, 26) };
    }
    function newLabel(anywhere) {
      return { t: FORMULAS[Math.floor(Math.random() * FORMULAS.length)], x: rnd(0, w), y: anywhere ? rnd(0, h) : h + 40, v: rnd(0.12, 0.3), s: rnd(15, 26), life: rnd(0, 6.28) };
    }

    const frame = (t) => {
      const dt = Math.min((t - last) / 16.7 || 1, 3);
      last = t;
      const P = document.documentElement.classList.contains("light") ? LIGHT : DARK;
      const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a * P.a})`;
      ctx.clearRect(0, 0, w, h);

      // formulas
      ctx.textAlign = "center";
      for (const l of labels) {
        l.y -= l.v * dt;
        l.life += 0.004 * dt;
        if (l.y < -40) Object.assign(l, newLabel(false));
        const fade = Math.min(1, Math.min(l.y + 40, h - l.y) / 160);
        ctx.font = `500 ${l.s}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(P.text, 0.07 * Math.max(0, fade) * (0.7 + 0.3 * Math.sin(l.life)));
        ctx.fillText(l.t, l.x, l.y);
      }

      // atoms
      for (const a of atoms) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) { const f = (1 - d / 140) * 0.9; a.vx += (dx / d) * f * 0.05 * dt; a.vy += (dy / d) * f * 0.05 * dt; }
        a.vx *= 0.995; a.vy *= 0.995;
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.x < -10) a.x = w + 10; if (a.x > w + 10) a.x = -10;
        if (a.y < -10) a.y = h + 10; if (a.y > h + 10) a.y = -10;
      }
      for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        for (let j = i + 1; j < atoms.length; j++) {
          const b = atoms[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.strokeStyle = rgb(P.bond, (1 - d / 120) * 0.22);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = rgb(P.atom, 0.5);
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }

      // bubbles
      for (const b of bubbles) {
        b.y -= b.v * dt;
        b.ph += 0.02 * dt;
        const x = b.x + Math.sin(b.ph) * b.sw * 0.3;
        if (b.y < -20) Object.assign(b, newBubble(false));
        ctx.strokeStyle = rgb(P.bubble, 0.22);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 6.283); ctx.stroke();
        ctx.fillStyle = rgb(P.bubble, 0.05);
        ctx.fill();
        ctx.fillStyle = rgb(P.bubble, 0.35);
        ctx.beginPath(); ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.8, b.r * 0.18), 0, 6.283); ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = mouse.y = -999; };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    build();
    frame(performance.now());
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 -z-10 w-full h-full pointer-events-none print:hidden" />;
}
