"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader, Card } from "@/components/UI";
import { useAppState } from "@/lib/store";
import notesData from "@/lib/data/notes.json";

function draw(canvas, { name, streak, xp, completed, total, accuracy }) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0E1420");
  grad.addColorStop(1, "#1B2438");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // flame accent bar
  const flameGrad = ctx.createLinearGradient(0, 0, W, 0);
  flameGrad.addColorStop(0, "#C8402C");
  flameGrad.addColorStop(0.5, "#E3A72E");
  flameGrad.addColorStop(1, "#2F9E6E");
  ctx.fillStyle = flameGrad;
  ctx.fillRect(0, 0, W, 10);

  // border
  ctx.strokeStyle = "rgba(148,163,184,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 30, W - 40, H - 60);

  ctx.textAlign = "center";

  // brand
  ctx.fillStyle = "#E3A72E";
  ctx.font = "600 22px 'Space Grotesk', sans-serif";
  ctx.fillText("ChemMaster AI — Progress Certificate", W / 2, 90);

  // name
  ctx.fillStyle = "#F6F3EC";
  ctx.font = "700 46px 'Space Grotesk', sans-serif";
  ctx.fillText(name || "Student", W / 2, 160);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "400 18px 'IBM Plex Sans', sans-serif";
  ctx.fillText("has been building a JEE chemistry revision streak", W / 2, 195);

  // stats row
  const stats = [
    { label: "Study Streak", value: `${streak}d`, color: "#C8402C" },
    { label: "Chapters Done", value: `${completed}/${total}`, color: "#2F9E6E" },
    { label: "Total XP", value: `${xp}`, color: "#E3A72E" },
    { label: "Accuracy", value: `${accuracy}%`, color: "#7C4DAA" },
  ];
  const boxW = (W - 120) / stats.length;
  stats.forEach((s, i) => {
    const cx = 60 + boxW * i + boxW / 2;
    ctx.fillStyle = s.color;
    ctx.font = "700 34px 'IBM Plex Mono', monospace";
    ctx.fillText(s.value, cx, 280);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "400 13px 'IBM Plex Sans', sans-serif";
    ctx.fillText(s.label.toUpperCase(), cx, 305);
  });

  // footer
  ctx.fillStyle = "#64748B";
  ctx.font = "400 13px 'IBM Plex Mono', monospace";
  ctx.fillText(
    `Generated on ${new Date().toLocaleDateString()} · #ChemMasterAI #BuildInPublic`,
    W / 2,
    H - 45
  );
}

export default function Certificate() {
  const { state, hydrated } = useAppState();
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const totalAttempts = Object.values(state.attempts || {}).reduce((a, v) => a + v.total, 0);
  const totalCorrect = Object.values(state.attempts || {}).reduce((a, v) => a + v.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const completed = notesData.filter((n) => state.progress[`${n.class_level}::${n.chapter}`]).length;

  useEffect(() => {
    if (!hydrated || !canvasRef.current) return;
    draw(canvasRef.current, {
      name: state.name,
      streak: state.streak,
      xp: state.xp,
      completed,
      total: notesData.length,
      accuracy,
    });
    setReady(true);
  }, [hydrated, state.name, state.streak, state.xp, completed, accuracy]);

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "chemmaster-progress-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Share · Progress Card"
        title="Export Your Progress"
        description="A shareable progress card generated from your local stats - great for a build-in-public LinkedIn post. Rendered entirely in your browser with no server upload."
      />
      <Card>
        <canvas
          ref={canvasRef}
          width={900}
          height={380}
          className="w-full h-auto rounded-lg border border-ink-border"
        />
        <button
          onClick={download}
          disabled={!ready}
          className="focus-ring mt-5 w-full rounded-lg bg-flame-gold text-ink font-medium px-4 py-3 text-sm disabled:opacity-40"
        >
          Download PNG
        </button>
      </Card>
    </div>
  );
}
