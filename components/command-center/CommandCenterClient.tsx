'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommandCenterClient() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showTokenField, setShowTokenField] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const url = repoUrl.trim();
    if (!url) { setError('A GitHub repository URL is required.'); return; }
    if (!/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url)) {
      setError('Enter a valid GitHub URL, e.g. https://github.com/owner/repo');
      return;
    }
    setError('');
    if (githubToken) sessionStorage.setItem('sentinai_token', githubToken);
    else sessionStorage.removeItem('sentinai_token');
    router.push(`/analyze?repo=${encodeURIComponent(url)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  const exampleRepos = [
    'https://github.com/expressjs/express',
    'https://github.com/vitejs/vite',
    'https://github.com/tailwindlabs/tailwindcss',
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-ta-bg relative overflow-hidden">
      {/* Ambient scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-px bg-ta-cyan animate-scan-line" />
      </div>

      {/* Panel */}
      <div className="w-full max-w-2xl">
        {/* Header label */}
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ta-text-muted mb-2">
            SECURITY TERMINAL
          </p>
          <h1 className="font-sans text-4xl font-bold text-ta-text tracking-tight leading-none">
            INITIATE_VULN_SCAN
          </h1>
          <p className="font-mono text-xs text-ta-text-muted mt-3 tracking-wider">
            Sovereign Auditor System v4.0.2 &nbsp;// &nbsp;Awaiting Vector
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-0">
          {/* URL input */}
          <div className="bg-ta-void border border-ta-border focus-within:border-ta-cyan transition-colors group">
            <div className="flex items-center">
              <span className="px-4 font-mono text-ta-cyan text-lg select-none flex-shrink-0">&gt;</span>
              <input
                ref={inputRef}
                type="url"
                value={repoUrl}
                onChange={e => { setRepoUrl(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/owner/repository"
                className="flex-1 bg-transparent py-4 pr-4 font-mono text-sm text-ta-text placeholder-ta-text-muted/40 focus:outline-none caret-ta-cyan"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Token row */}
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setShowTokenField(v => !v)}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ta-text-muted hover:text-ta-cyan transition-colors"
            >
              <span className="text-xs">🔒</span>
              ADD_GITHUB_TOKEN
            </button>
            <span className="h-px flex-1 bg-ta-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ta-text-muted">
              ENVIRONMENT: PRODUCTION_MAIN
            </span>
          </div>

          {/* Token field (collapsible) */}
          {showTokenField && (
            <div className="mt-2 bg-ta-void border border-ta-border focus-within:border-ta-amber transition-colors">
              <div className="flex items-center">
                <span className="px-4 font-mono text-ta-amber text-lg select-none flex-shrink-0">$</span>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-transparent py-3 font-mono text-sm text-ta-text placeholder-ta-text-muted/40 focus:outline-none caret-ta-amber"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(v => !v)}
                  className="px-4 font-mono text-[9px] text-ta-text-muted hover:text-ta-text uppercase tracking-wider"
                >
                  {showToken ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-2 font-mono text-[10px] text-ta-red tracking-wider">
              ⚠ {error}
            </p>
          )}

          {/* CTA row */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="px-10 py-3.5 bg-ta-cyan text-ta-void font-mono font-bold text-sm uppercase tracking-widest hover:bg-ta-cyan-glow active:opacity-80 transition-all duration-100 shadow-cyan-glow"
            >
              ANALYZE
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ta-text-muted tracking-wider">↗</span>
              <kbd className="font-mono text-[10px] text-ta-text-muted border border-ta-border px-2 py-1">
                ⌘ + ENTER
              </kbd>
            </div>
          </div>
        </form>

        {/* Example repos */}
        <div className="mt-10 pt-6 border-t border-ta-border">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ta-text-muted mb-3">
            EXAMPLE_TARGETS
          </p>
          <div className="space-y-1">
            {exampleRepos.map(repo => (
              <button
                key={repo}
                type="button"
                onClick={() => setRepoUrl(repo)}
                className="block font-mono text-xs text-ta-text-muted hover:text-ta-cyan transition-colors tracking-wider"
              >
                → {repo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer metrics strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-ta-border bg-ta-void px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {[
            { label: 'PACKET_LOSS', value: '0.00%' },
            { label: 'LATENCY', value: '12MS' },
            { label: 'SEC_LEVEL', value: 'SOVEREIGN' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-ta-text-muted uppercase tracking-widest">{label}:</span>
              <span className="font-mono text-[9px] text-ta-cyan uppercase tracking-widest">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[9px] text-ta-text-muted uppercase tracking-widest">
            AUTH: AUDITOR_01
          </span>
          <span className="font-mono text-[9px] text-ta-text-muted uppercase tracking-widest">
            CID: 882.11.90.X
          </span>
        </div>
      </div>
    </main>
  );
}
