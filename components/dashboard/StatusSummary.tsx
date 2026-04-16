import type { AnalysisResult } from '@/types';
import MetricCard from '@/components/ui/MetricCard';

interface StatusSummaryProps {
  result: AnalysisResult;
}

export default function StatusSummary({ result }: StatusSummaryProps) {
  const score = result.productionReadinessScore;
  const scoreVariant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'critical';

  return (
    <div className="bg-ta-surface-mid border border-ta-border p-5">
      {/* Repo info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[9px] text-ta-text-muted uppercase tracking-[0.15em] mb-1">TARGET_REPOSITORY</p>
          <p className="font-mono text-sm text-ta-text font-bold tracking-wide">{result.repoName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] text-ta-text-muted uppercase tracking-[0.15em] mb-1">ENVIRONMENT</p>
          <p className="font-mono text-xs text-ta-text-dim">{result.environment}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex gap-3 flex-wrap">
        <MetricCard
          label="PRODUCTION_READY"
          value={`${score}% STABLE`}
          variant={scoreVariant}
          className="flex-1 min-w-[140px]"
        />
        <MetricCard
          label="BUILD_VERSION"
          value={result.buildVersion}
          variant="default"
          className="flex-1 min-w-[140px]"
        />
        <MetricCard
          label="TESTS_PASSED"
          value={result.testsPassed.toLocaleString()}
          variant="success"
          className="flex-1 min-w-[120px]"
        />
        <MetricCard
          label="VULNERABILITIES"
          value={result.totalVulnerabilities}
          variant={result.totalVulnerabilities > 0 ? 'warning' : 'success'}
          className="flex-1 min-w-[120px]"
        />
        <MetricCard
          label="CRITICAL_FAILURES"
          value={String(result.criticalCount).padStart(2, '0')}
          variant={result.criticalCount > 0 ? 'critical' : 'success'}
          className="flex-1 min-w-[120px]"
        />
      </div>

      {/* Executive summary */}
      <div className="mt-4 pt-4 border-t border-ta-border">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ta-text-muted mb-2">EXECUTIVE_SUMMARY</p>
        <p className="font-inter text-xs text-ta-text-dim leading-relaxed">{result.executiveSummary}</p>
      </div>

      {/* Footer meta */}
      <div className="mt-4 pt-3 border-t border-ta-border flex items-center gap-6 text-[9px] font-mono text-ta-text-muted uppercase tracking-widest">
        <span>COMPLEXITY: {result.complexity}</span>
        <span>AUTH: {result.agentId}</span>
        <span>
          {Math.round((Date.now() - new Date(result.timestamp).getTime()) / 60000)}_MIN_AGO
        </span>
      </div>
    </div>
  );
}
