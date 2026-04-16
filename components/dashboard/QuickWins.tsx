'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/types';

interface QuickWinsProps {
  result: AnalysisResult;
}

export default function QuickWins({ result }: QuickWinsProps) {
  const [executed, setExecuted] = useState<Set<string>>(new Set());

  const executeGroup = () => {
    const newSet = new Set(result.quickWins.map(q => q.id));
    setExecuted(newSet);
  };

  return (
    <div className="bg-ta-surface-mid border border-ta-cyan/20">
      <div className="px-5 py-3 border-b border-ta-border flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ta-cyan mb-0.5">QUICK_WINS</p>
          <p className="font-inter text-[10px] text-ta-text-muted">High-impact improvements achievable in under 20 minutes</p>
        </div>
        <button
          onClick={executeGroup}
          className="px-4 py-2 bg-ta-cyan/10 border border-ta-cyan/30 text-ta-cyan font-mono text-[9px] uppercase tracking-widest hover:bg-ta-cyan/20 transition-colors"
        >
          EXECUTE_PATCH_GROUP
        </button>
      </div>

      <div className="divide-y divide-ta-border">
        {result.quickWins.map(win => {
          const done = executed.has(win.id);
          return (
            <div
              key={win.id}
              className={['flex items-center justify-between px-5 py-3.5 transition-colors', done ? 'opacity-40' : ''].join(' ')}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-[9px] text-ta-text-muted flex-shrink-0">{win.id}</span>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-ta-text tracking-wide">{win.title.replace(/_/g, ' ')}</p>
                  <p className="font-inter text-[10px] text-ta-text-muted mt-0.5 truncate">{win.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="font-mono text-sm font-bold text-ta-cyan">+{win.impact}%</span>
                {done && <span className="font-mono text-[9px] text-ta-cyan">✓ APPLIED</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
