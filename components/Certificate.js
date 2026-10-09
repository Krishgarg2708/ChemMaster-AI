"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader, Card } from "@/components/UI";
import { useAppState } from "@/lib/store";
import notesData from "@/lib/data/notes.json";

const W = 1600;
const H = 1100;

const THEMES = {
  chalkboard: {
    label: "Chalkboard",
    bg1: "#0E2A20", bg2: "#06110D", text: "#F2F7F3", muted: "#9DB8AB",
    gold1: "#FFE58A", gold2: "#E0A82E", accent: "#5EE6B0", card: "rgba(255,255,255,0.05)",
    cardLine: "rgba(94,230,176,0.25)", glow: "rgba(255,216,77,0.16)", line: "rgba(108,196,255,0.06)",
  },
  ivory: {
    label: "Ivory (print)",
    bg1: "#FFFDF6", bg2: "#F1ECDC", text: "#12261E", muted: "#5B6E64",
    gold1: "#C99A2E", gold2: "#8F6A12", accent: "#0F8A62", card: "rgba(15,60,40,0.05)",
    cardLine: "rgba(15,60,40,0.18)", glow: "rgba(201,154,46,0.14)", line: "rgba(40,110,180,0.07)",
  },
};

const RANKS = [
  [0, "Lab Newcomer"],
  [50, "Reagent Rookie"],
  [150, "Bond Builder"],
  [350, "Titration Pro"],
  [700, "Reaction Master"],
  [1200, "Periodic Prodigy"],
];
const rankFor = (xp) => [...RANKS].reverse().find(([min]) => xp >= min)[1];

function certId(name, xp, streak) {
  let h = 2166136261;
  for (const c of `${name}|${xp}|${streak}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const s = (h >>> 0).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
  return `CM-${s.slice(0, 4)}-${s.slice(4)}`;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hex(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 3 * i + Math.PI / 6;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

function gold(ctx, x0, y0, x1, y1, T) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, T.gold1);
  g.addColorStop(0.5, T.gold2);
  g.addColorStop(1, T.gold1);
  return g;
}

function spaced(ctx, text, x, y, spacing) {
  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(text, x + spacing / 2, y);
    ctx.letterSpacing = "0px";
  } else ctx.fillText(text, x, y);
}

function draw(canvas, data, T) {
  const ctx = canvas.getContext("2d");
  const { name, streak, xp, completed, total, accuracy } = data;
  const DISPLAY = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const BODY = "'Hanken Grotesk', 'Segoe UI', sans-serif";
  const MONO = "'JetBrains Mono', monospace";
  ctx.clearRect(0, 0, W, H);

  // paper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, T.bg1);
  bg.addColorStop(1, T.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = T.line;
  for (let y = 36; y < H; y += 36) ctx.fillRect(0, y, W, 1);
  let g = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 700);
  g.addColorStop(0, T.glow);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // watermark: concentric electron shells
  ctx.save();
  ctx.translate(W / 2, H / 2 + 40);
  ctx.strokeStyle = T.gold2;
  ctx.globalAlpha = 0.07;
  ctx.lineWidth = 2;
  for (let r = 120; r <= 560; r += 110) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + r;
      ctx.beginPath();
      ctx.arc(r * Math.cos(a), r * Math.sin(a), 6, 0, Math.PI * 2);
      ctx.fillStyle = T.gold2;
      ctx.fill();
    }
  }
  ctx.restore();

  // double gold frame
  ctx.lineWidth = 8;
  ctx.strokeStyle = gold(ctx, 0, 0, W, H, T);
  rr(ctx, 34, 34, W - 68, H - 68, 18);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = T.gold2;
  ctx.globalAlpha = 0.6;
  rr(ctx, 58, 58, W - 116, H - 116, 10);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // benzene-ring corners
  [[96, 96], [W - 96, 96], [96, H - 96], [W - 96, H - 96]].forEach(([x, y]) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = gold(ctx, x - 40, y - 40, x + 40, y + 40, T);
    hex(ctx, x, y, 34);
    ctx.stroke();
    hex(ctx, x, y, 20);
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = T.gold1;
    ctx.fill();
  });

  ctx.textAlign = "center";

  // atom emblem
  ctx.save();
  ctx.translate(W / 2, 170);
  ctx.lineWidth = 3;
  ctx.strokeStyle = gold(ctx, -60, -60, 60, 60, T);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 3) * i);
    ctx.beginPath();
    ctx.ellipse(0, 0, 66, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(66, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = T.accent;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = gold(ctx, -10, -10, 10, 10, T);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = T.gold2;
  ctx.font = `600 22px ${BODY}`;
  spaced(ctx, "CERTIFICATE OF PROGRESS", W / 2, 296, 9);

  ctx.fillStyle = T.muted;
  ctx.font = `italic 400 28px ${BODY}`;
  ctx.fillText("This certifies that", W / 2, 360);

  // name, shrunk to fit
  const nm = name || "Student";
  let size = 132;
  ctx.font = `800 ${size}px ${DISPLAY}`;
  while (ctx.measureText(nm).width > W - 400 && size > 56) {
    size -= 4;
    ctx.font = `800 ${size}px ${DISPLAY}`;
  }
  ctx.fillStyle = gold(ctx, W / 2 - 400, 400, W / 2 + 400, 520, T);
  ctx.fillText(nm, W / 2, 490);

  ctx.strokeStyle = T.gold2;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 520);
  ctx.lineTo(W / 2 + 280, 520);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = T.text;
  ctx.font = `400 30px ${BODY}`;
  ctx.fillText("has reached the rank of", W / 2, 578);
  ctx.fillStyle = T.accent;
  ctx.font = `700 52px ${DISPLAY}`;
  ctx.fillText(rankFor(xp), W / 2, 642);
  ctx.fillStyle = T.muted;
  ctx.font = `400 24px ${BODY}`;
  ctx.fillText("through steady revision of Class 11 and Class 12 chemistry", W / 2, 686);

  // stat cards
  const stats = [
    ["Day streak", `${streak}`, "#FF6B6B"],
    ["Chapters done", `${completed}/${total}`, T.accent],
    ["XP earned", `${xp}`, T.gold2 === "#8F6A12" ? "#B8860B" : "#FFD84D"],
    ["Accuracy", `${accuracy}%`, "#7C8CFF"],
  ];
  const cw = 300, gap = 36;
  const x0 = (W - (cw * 4 + gap * 3)) / 2;
  stats.forEach(([label, value, color], i) => {
    const x = x0 + i * (cw + gap);
    rr(ctx, x, 730, cw, 130, 18);
    ctx.fillStyle = T.card;
    ctx.fill();
    ctx.strokeStyle = T.cardLine;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(x + 24, 730, 56, 4);
    ctx.font = `700 60px ${DISPLAY}`;
    ctx.fillText(value, x + cw / 2, 806);
    ctx.fillStyle = T.muted;
    ctx.font = `500 21px ${BODY}`;
    ctx.fillText(label, x + cw / 2, 840);
  });

  // chapter progress bar
  const bx = x0, bw = cw * 4 + gap * 3;
  rr(ctx, bx, 888, bw, 12, 6);
  ctx.fillStyle = T.card;
  ctx.fill();
  const pct = total ? completed / total : 0;
  if (pct > 0) {
    rr(ctx, bx, 888, Math.max(12, bw * pct), 12, 6);
    ctx.fillStyle = gold(ctx, bx, 0, bx + bw, 0, T);
    ctx.fill();
  }

  // footer: date / seal / issuer
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  ctx.textAlign = "left";
  ctx.fillStyle = T.text;
  ctx.font = `600 24px ${BODY}`;
  ctx.fillText(date, 170, 972);
  ctx.fillStyle = T.muted;
  ctx.font = `400 18px ${MONO}`;
  ctx.fillText(`ID ${certId(nm, xp, streak)}`, 170, 1004);

  ctx.textAlign = "right";
  ctx.fillStyle = T.gold2;
  ctx.font = `italic 700 44px ${DISPLAY}`;
  ctx.fillText("ChemMaster AI", W - 170, 980);
  ctx.fillStyle = T.muted;
  ctx.font = `400 18px ${BODY}`;
  ctx.fillText("Intelligent chemistry for a brighter tomorrow", W - 170, 1008);

  // seal
  ctx.textAlign = "center";
  const sx = W / 2, sy = 975;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(sx + 50 * Math.cos(a), sy + 50 * Math.sin(a), 7, 0, Math.PI * 2);
    ctx.fillStyle = gold(ctx, sx - 50, sy - 50, sx + 50, sy + 50, T);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(sx, sy, 46, 0, Math.PI * 2);
  ctx.fillStyle = gold(ctx, sx - 46, sy - 46, sx + 46, sy + 46, T);
  ctx.fill();
  ctx.strokeStyle = T.bg2;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy, 37, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = T.bg2;
  ctx.font = `800 40px ${DISPLAY}`;
  ctx.fillText("Cm", sx, sy + 14);
}

export default function Certificate() {
  const { state, hydrated, setName } = useAppState();
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [theme, setTheme] = useState("chalkboard");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hydrated) setNameDraft(state.name);
  }, [hydrated, state.name]);

  const totalAttempts = Object.values(state.attempts || {}).reduce((a, v) => a + v.total, 0);
  const totalCorrect = Object.values(state.attempts || {}).reduce((a, v) => a + v.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const completed = notesData.filter((n) => state.progress[`${n.class_level}::${n.chapter}`]).length;

  useEffect(() => {
    if (!hydrated || !canvasRef.current) return;
    const data = { name: state.name, streak: state.streak, xp: state.xp, completed, total: notesData.length, accuracy };
    let cancelled = false;
    const paint = () => !cancelled && canvasRef.current && draw(canvasRef.current, data, THEMES[theme]);
    paint();
    setReady(true);
    // redraw once the web fonts are available so the card never shows fallback type
    document.fonts?.ready.then(paint);
    return () => {
      cancelled = true;
    };
  }, [hydrated, state.name, state.streak, state.xp, completed, accuracy, theme]);

  const download = () => {
    const link = document.createElement("a");
    link.download = "chemmaster-certificate.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const caption = `I just reached "${rankFor(state.xp)}" on ChemMaster AI: ${state.streak}-day streak, ${completed}/${notesData.length} chapters done, ${state.xp} XP. #ChemMasterAI #JEE #BuildInPublic`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <PageHeader
        title="Your certificate"
        description="A certificate built from your real streak, chapters, XP and accuracy. It is drawn in your browser, so nothing is uploaded."
      />
      <Card>
        <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-5">
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Name on certificate</div>
            <div className="flex gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setName(nameDraft)}
                maxLength={40}
                placeholder="Your name"
                className="focus-ring surface-2 rounded-lg px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={() => setName(nameDraft)}
                className="focus-ring rounded-lg border border-ink-border px-4 py-2 text-sm hover:bg-ink-softer/70 transition-colors"
              >
                Update name
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Style</div>
            <div className="flex gap-2">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  aria-pressed={theme === key}
                  className={`focus-ring rounded-lg px-4 py-2 text-sm transition-colors ${
                    theme === key ? "bg-flame-gold text-ink font-medium" : "border border-ink-border hover:bg-ink-softer/70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto rounded-xl border border-ink-border shadow-2xl"
        />

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <button
            onClick={download}
            disabled={!ready}
            className="focus-ring rounded-xl bg-flame-gold text-ink font-semibold px-4 py-3 text-sm disabled:opacity-40 hover:brightness-110 transition"
          >
            Download certificate (PNG)
          </button>
          <button
            onClick={copy}
            className="focus-ring rounded-xl border border-ink-border px-4 py-3 text-sm hover:bg-ink-softer/70 transition-colors"
          >
            {copied ? "Caption copied" : "Copy LinkedIn caption"}
          </button>
        </div>
      </Card>
    </div>
  );
}
