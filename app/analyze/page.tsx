import { Suspense } from 'react';
import AnalysisHUDClient from '@/components/analysis-hud/AnalysisHUDClient';

// Loading fallback while searchParams resolves
function AnalysisLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-ta-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-ta-cyan border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-[10px] text-ta-text-muted uppercase tracking-widest animate-pulse">
          INITIALIZING_SCAN_ENGINE...
        </p>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisHUDClient />
    </Suspense>
  );
}
