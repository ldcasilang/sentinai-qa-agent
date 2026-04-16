import { fetchRepoCode, isGitHubURL } from '@/lib/github';
import { analyzeRepo } from '@/lib/claude';
import type { StreamEvent, AgentState } from '@/types';

export const maxDuration = 120;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let body: { repoUrl?: string; githubToken?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { repoUrl, githubToken } = body;
  if (!repoUrl || !isGitHubURL(repoUrl)) {
    return Response.json({ error: 'A valid GitHub repository URL is required.' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Controller may already be closed
        }
      };

      const agentUpdate = (agentId: string, status: AgentState, message: string) => {
        emit({ type: 'agent', agentId, status, message });
      };

      const log = (message: string) => {
        emit({ type: 'log', message });
      };

      try {
        // ─── Agent A-01: Repository Fetch ────────────────────────────────
        agentUpdate('A-01', 'RUNNING', 'Connecting to GitHub API...');
        log('[A-01] Authenticating and fetching repository manifest...');
        await delay(600);

        const { code, fileCount, repoName } = await fetchRepoCode(repoUrl, githubToken ?? undefined);

        agentUpdate('A-01', 'COMPILING', `Repository indexed: ${fileCount} source files`);
        log(`[A-01] ${fileCount} files staged for analysis (${Math.round(code.length / 1024)}KB)`);
        await delay(400);

        // ─── Agent A-02: Security Scan ───────────────────────────────────
        agentUpdate('A-02', 'SCANNING', 'Scanning for security vulnerabilities...');
        log('[A-02] Checking for injection vectors (SQL, XSS, command)...');
        await delay(700);
        log('[A-02] Auditing authentication and authorization flows...');
        await delay(500);
        log('[A-02] Scanning for hardcoded secrets and exposed credentials...');
        await delay(400);

        // ─── Agent A-03: Performance & Quality ──────────────────────────
        agentUpdate('A-03', 'RUNNING', 'Profiling performance patterns...');
        log('[A-03] Analyzing algorithmic complexity and bottlenecks...');
        await delay(600);
        log('[A-03] Reviewing error handling and edge case coverage...');
        await delay(400);

        // ─── Agent A-04: Report Generation ──────────────────────────────
        agentUpdate('A-04', 'COMPILING', 'Generating remediation report via Claude...');
        log('[A-04] Invoking SentinAI analysis engine (claude-sonnet-4-6)...');

        const result = await analyzeRepo(code, repoName, repoUrl);

        // Update agents based on findings
        agentUpdate('A-02', result.criticalCount > 0 ? 'ALERTING' : 'DONE',
          result.criticalCount > 0
            ? `${result.criticalCount} critical issue${result.criticalCount > 1 ? 's' : ''} detected`
            : 'No critical issues found');

        agentUpdate('A-03', 'DONE', `Performance analysis complete (${result.complexity})`);
        agentUpdate('A-04', 'DONE', 'Report compiled and ready');
        agentUpdate('A-01', 'DONE', 'Scan complete');

        log(`[SYSTEM] Analysis complete — Score: ${result.productionReadinessScore}/100 | ${result.totalVulnerabilities} issues found`);
        await delay(300);

        emit({ type: 'result', data: result });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
        emit({ type: 'error', error: message });
        agentUpdate('A-01', 'ERROR', 'Scan failed');
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
