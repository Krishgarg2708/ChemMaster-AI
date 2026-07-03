"use client";

import { Card } from "@/components/UI";
import tricks from "@/lib/data/periodic_tricks.json";

export default function MnemonicsView() {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-6 max-w-2xl">
        Classic group-wise and period-wise memory tricks used by Indian students to recall element order.
        Each card gives an English mnemonic, a Hinglish version, and the chemistry reason behind the trend.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {tricks.map((t) => (
          <Card key={t.id} className="!p-5">
            <div className="text-[11px] uppercase tracking-wide text-flame-gold mb-1">{t.title}</div>
            <div className="font-mono text-xs text-slate-500 mb-3">{t.elements}</div>

            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">English</div>
              <p className="text-sm">{t.mnemonic_en}</p>
            </div>

            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Hinglish</div>
              <p className="text-sm">{t.mnemonic_hi}</p>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed border-l-2 border-flame-violet pl-3">
              {t.explanation}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
