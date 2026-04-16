'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import type { AgentStatus, AgentState, StreamEvent, AnalysisResult } from '@/types';

const INITIAL_AGENTS: AgentStatus[] = [
  { id: 'A-01', label: 'REPO_FETCHER', status: 'IDLE', task: 'Awaiting initialization...' },
  { id: 'A-02', label: 'SEC_SCANNER', status: 'IDLE', task: 'Awaiting initialization...' },
  { id: 'A-03', label: 'PERF_PROFILER', status: 'IDLE', task: 'Awaiting initialization...' },
  { id: 'A-04', label: 'REPORT_GEN', status: 'IDLE', task: 'Awaiting initialization...' },
];

const agentStatusColor: Record<AgentState, string> = {
  IDLE: 'text-ta-text-muted border-ta-border',
  RUNNING: 'text-ta-cyan border-ta-cyan/40 bg-ta-cyan/5',
  SCANNING: 'text-ta-cyan border-ta-cyan/40 bg-ta-cyan/5',
  COMPILING: 'text-ta-amber border-ta-amber/40 bg-ta-amber/5',
  ALERTING: 'text-ta-red border-ta-red/40 bg-ta-red-bg/30',
  DONE: 'text-ta-text-dim border-ta-border',
  ERROR: 'text-ta-red border-ta-red/40',
};

const RESULT_KEY = 'sentinai_result';
const MAX_LOG_LINES = 60;

export default function AnalysisHUDClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get('repo') ?? '';

  const [agents, setAgents] = useState<AgentStatus[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] SentinAI Analysis Engine v4.0.2 initialized.', '[SYSTEM] Awaiting scan vector...']);
  const [phase, setPhase] = useState<'connecting' | 'analyzing' | 'done' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const [cpuLoad, setCpuLoad] = useState(12);
  const [memUsage, setMemUsage] = useState(2.1);
  const [syncProgress, setSyncProgress] = useState(0);
  const [threatLevel, setThreatLevel] = useState<'NOMINAL' | 'ELEVATED' | 'CRITICAL'>('NOMINAL');

  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const appendLog = (msg: string) => {
    setLogs(prev => {
      const next = [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${msg}`];
      return next.slice(-MAX_LOG_LINES);
    });
  };

  const updateAgent = (id: string, status: AgentState, task: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status, task } : a));
  };

  // Simulate live metrics during analysis
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(98, prev + Math.random() * 8 - 2));
      setMemUsage(prev => Math.min(15.9, Math.max(2.1, prev + Math.random() * 0.4 - 0.1)));
      setSyncProgress(prev => Math.min(95, prev + Math.random() * 4));
    }, 800);
    return () => clearInterval(interval);
  }, [phase]);

  // Scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!repoUrl) {
      router.replace('/');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const githubToken = sessionStorage.getItem('sentinai_token') ?? undefined;

    async function run() {
      setPhase('analyzing');
      appendLog(`[SYSTEM] Target: ${repoUrl}`);
      appendLog('[SYSTEM] Initializing agent swarm...');
      setSyncProgress(5);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl, githubToken }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error ?? `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;
            let event: StreamEvent;
            try { event = JSON.parse(part.slice(6)); } catch { continue; }

            if (event.type === 'agent' && event.agentId && event.status) {
              updateAgent(event.agentId, event.status, event.message ?? '');
              if (event.status === 'ALERTING') setThreatLevel('CRITICAL');
              else if (event.status === 'SCANNING' || event.status === 'RUNNING') setThreatLevel('ELEVATED');
            }

            if (event.type === 'log' && event.message) {
              appendLog(event.message);
            }

            if (event.type === 'result' && event.data) {
              const result: AnalysisResult = event.data;
              setSyncProgress(100);
              setCpuLoad(22);
              setPhase('done');
              sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
              appendLog('[SYSTEM] Results stored. Redirecting to dashboard...');
              setTimeout(() => router.push('/dashboard'), 1200);
            }

            if (event.type === 'error') {
              throw new Error(event.error ?? 'Unknown error');
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Analysis failed';
        setErrorMsg(msg);
        setPhase('error');
        appendLog(`[ERROR] ${msg}`);
      }
    }

    run();
    return () => controller.abort();
  }, [repoUrl, router]);

  const handleAbort = () => {
    abortRef.current?.abort();
    router.push('/');
  };

  const threatVariant = threatLevel === 'CRITICAL' ? 'critical' : threatLevel === 'ELEVATED' ? 'warning' : 'success';

  return (
    <div className="flex flex-col h-screen bg-ta-bg overflow-hidden">
      <Header showScanButton={false} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onInitiateScan={handleAbort} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-ta-void border-b border-ta-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ta-text-dim tracking-widest">
                Processing_State::<span className="text-ta-cyan">ANALYSIS_HUD</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-ta-text-muted tracking-widest">
                ENCRYPTED_SESSION: 0x8842_AF21
              </span>
              <span className={[
                'font-mono text-[9px] uppercase tracking-widest',
                phase === 'error' ? 'text-ta-red' : 'text-ta-cyan',
              ].join(' ')}>
                STATUS: {phase === 'analyzing' ? 'ONLINE' : phase === 'done' ? 'COMPLETE' : phase === 'error' ? 'ERROR' : 'CONNECTING'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Error state */}
            {phase === 'error' && (
              <div className="border border-ta-red/40 bg-ta-red-bg/20 p-4">
                <p className="font-mono text-sm text-ta-red tracking-wider">
                  ⚠ SCAN_FAILED: {errorMsg}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-3 font-mono text-[10px] text-ta-text-muted hover:text-ta-cyan uppercase tracking-widest"
                >
                  ← RETURN_TO_COMMAND_CENTER
                </button>
              </div>
            )}

            {/* System metrics */}
            <div className="flex gap-3">
              <MetricCard label="CPU_LOAD" value={`${cpuLoad.toFixed(1)}%`} variant={cpuLoad > 80 ? 'critical' : cpuLoad > 60 ? 'warning' : 'default'} />
              <MetricCard label="MEMORY" value={`${memUsage.toFixed(1)}GB`} variant="default" />
              <MetricCard label="THREAT_LVL" value={threatLevel} variant={threatVariant} />
            </div>

            {/* Terminal console */}
            <div className="bg-ta-void border border-ta-border">
              <div className="flex items-center justify-between px-4 py-2 border-b border-ta-border">
                <span className="font-mono text-[9px] text-ta-text-muted uppercase tracking-widest">
                  TERMINAL_OUTPUT
                </span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ta-red-bg" />
                  <span className="w-2 h-2 rounded-full bg-ta-amber/40" />
                  <span className="w-2 h-2 rounded-full bg-ta-cyan/40" />
                </div>
              </div>
              <div className="h-44 overflow-y-auto p-4 space-y-1 scrollbar-hide">
                {logs.map((line, i) => (
                  <p key={i} className="font-mono text-[10px] text-ta-text-dim leading-relaxed">
                    <span className={line.includes('[ERROR]') ? 'text-ta-red' : line.includes('[SYSTEM]') ? 'text-ta-cyan' : 'text-ta-text-dim'}>
                      {line}
                    </span>
                  </p>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Telemetry */}
            <div className="bg-ta-surface-mid border border-ta-border p-4 space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ta-text-muted">
                INTEGRITY_TELEMETRY
              </p>
              <ProgressBar value={syncProgress} label="SYSTEM_SYNC" variant={syncProgress > 90 ? 'cyan' : 'amber'} />
              <ProgressBar value={99.8} label="DATA_INTEGRITY" variant="cyan" />
            </div>

            {/* Agent orchestrator table */}
            <div className="bg-ta-surface-mid border border-ta-border overflow-hidden">
              <div className="px-4 py-2 border-b border-ta-border">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ta-text-muted">
                  AGENT_ORCHESTRATOR
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ta-border">
                    {['AGENT_ID', 'LABEL', 'STATE', 'CURRENT_TASK'].map(col => (
                      <th key={col} className="px-4 py-2 text-left font-mono text-[8px] uppercase tracking-widest text-ta-text-muted">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.id} className="border-b border-ta-border/50 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-ta-cyan">{agent.id}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-ta-text-muted">{agent.label}</td>
                      <td className="px-4 py-2.5">
                        <span className={['text-[9px] font-mono font-bold px-2 py-0.5 border uppercase tracking-widest', agentStatusColor[agent.status]].join(' ')}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-ta-text-dim max-w-xs truncate">
                        {agent.task}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System status indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ta-surface-mid border border-ta-border p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-ta-cyan animate-neon-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-ta-text-dim">
                  ENCRYPTED_STREAM_ACTIVE
                </span>
              </div>
              <div className="bg-ta-surface-mid border border-ta-border p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-ta-cyan animate-neon-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-ta-text-dim">
                  GATEWAY_ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-ta-border bg-ta-void flex-shrink-0">
            <button
              onClick={handleAbort}
              disabled={phase === 'done'}
              className="px-6 py-2.5 border border-ta-red/40 text-ta-red font-mono text-[10px] uppercase tracking-widest hover:bg-ta-red-bg/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ABORT_SCAN
            </button>
            <button
              disabled={phase !== 'done'}
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 border border-ta-cyan/40 text-ta-cyan font-mono text-[10px] uppercase tracking-widest hover:bg-ta-cyan/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              EXTRACT_REPORT
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
