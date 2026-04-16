'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import StatusSummary from '@/components/dashboard/StatusSummary';
import VulnerabilityCard from '@/components/dashboard/VulnerabilityCard';
import QuickWins from '@/components/dashboard/QuickWins';
import type { AnalysisResult, Severity } from '@/types';

const RESULT_KEY = 'sentinai_result';
const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

type SortOrder = 'SEVERITY_DESC' | 'SEVERITY_ASC' | 'CATEGORY';
type FilterSeverity = 'all' | Severity;

export default function DashboardClient() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('SEVERITY_DESC');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) { router.replace('/'); return; }
    try { setResult(JSON.parse(raw)); } catch { router.replace('/'); }
  }, [router]);

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-ta-bg">
        <div className="text-ta-text-muted font-mono text-xs animate-pulse tracking-widest">
          LOADING_RESULTS...
        </div>
      </div>
    );
  }

  const sortedVulns = [...result.vulnerabilities]
    .filter(v => filterSeverity === 'all' || v.severity === filterSeverity)
    .sort((a, b) => {
      if (sortOrder === 'SEVERITY_DESC') return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      if (sortOrder === 'SEVERITY_ASC') return SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity);
      return a.category.localeCompare(b.category);
    });

  const counts: Record<Severity, number> = {
    critical: result.criticalCount,
    high: result.highCount,
    medium: result.mediumCount,
    low: result.lowCount,
  };

  return (
    <div className="flex flex-col h-screen bg-ta-bg overflow-hidden">
      <Header onInitiateScan={() => router.push('/')} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onInitiateScan={() => router.push('/')} />

        <main className="flex-1 overflow-y-auto p-6 space-y-5" id="vulnerabilities">
          {/* Status summary card */}
          <StatusSummary result={result} />

          {/* Vulnerability list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <h2 className="font-mono text-xs text-ta-text-dim uppercase tracking-[0.15em]">
                  AUDIT_RESULTS
                </h2>
                {/* Severity filter */}
                <div className="flex items-center gap-1">
                  {(['all', ...SEVERITY_ORDER] as const).map(sev => {
                    const count = sev === 'all' ? result.totalVulnerabilities : counts[sev];
                    const active = filterSeverity === sev;
                    return (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        className={[
                          'px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest transition-colors border',
                          active
                            ? sev === 'critical' ? 'bg-ta-red-bg border-ta-red/50 text-ta-red'
                            : sev === 'high' ? 'bg-ta-amber/10 border-ta-amber/40 text-ta-amber'
                            : sev === 'medium' ? 'bg-ta-cyan/5 border-ta-cyan/30 text-ta-cyan-dim'
                            : sev === 'low' ? 'bg-ta-surface-high border-ta-border text-ta-text-dim'
                            : 'bg-ta-surface-high border-ta-border text-ta-text-dim'
                            : 'border-transparent text-ta-text-muted hover:text-ta-text',
                        ].join(' ')}
                      >
                        {sev === 'all' ? `ALL (${count})` : `${sev.toUpperCase()} (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort control */}
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortOrder)}
                className="bg-ta-surface-mid border border-ta-border text-ta-text-muted font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 focus:outline-none focus:border-ta-cyan"
              >
                <option value="SEVERITY_DESC">SEVERITY_DESC</option>
                <option value="SEVERITY_ASC">SEVERITY_ASC</option>
                <option value="CATEGORY">CATEGORY</option>
              </select>
            </div>

            {sortedVulns.length === 0 ? (
              <div className="border border-ta-border bg-ta-surface-mid p-8 text-center">
                <p className="font-mono text-xs text-ta-text-muted tracking-widest">
                  NO_VULNERABILITIES_MATCHING_FILTER
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVulns.map(vuln => (
                  <VulnerabilityCard key={vuln.id} vuln={vuln} />
                ))}
              </div>
            )}
          </div>

          {/* Quick wins */}
          {result.quickWins.length > 0 && <QuickWins result={result} />}

          {/* Node visualizer placeholder */}
          <div className="border border-ta-border bg-ta-surface-mid p-8 flex flex-col items-center justify-center gap-3 min-h-[140px]">
            <div className="grid grid-cols-4 gap-3 mb-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={['w-2 h-2 rounded-full', i < result.criticalCount ? 'bg-ta-red animate-neon-pulse' : i < result.criticalCount + result.highCount ? 'bg-ta-amber' : 'bg-ta-cyan/40'].join(' ')} />
                  <div className={['h-px w-8', i < result.totalVulnerabilities ? 'bg-ta-border' : 'bg-ta-surface-high'].join(' ')} />
                </div>
              ))}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ta-text-muted">
              NODE_VISUALIZER · {result.repoName}
            </span>
          </div>

          {/* Bottom nav strip */}
          <div className="flex items-center justify-center gap-8 py-2 border-t border-ta-border">
            {[
              { label: 'DASH', href: '/dashboard' },
              { label: 'ISSUES', href: '/dashboard#vulnerabilities' },
              { label: 'SETUP', href: '/' },
            ].map(({ label, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="font-mono text-[9px] uppercase tracking-widest text-ta-text-muted hover:text-ta-cyan transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
