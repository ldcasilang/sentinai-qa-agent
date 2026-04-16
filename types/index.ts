export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'security' | 'performance' | 'quality' | 'accessibility';
export type AgentState = 'IDLE' | 'RUNNING' | 'COMPILING' | 'ALERTING' | 'SCANNING' | 'DONE' | 'ERROR';

export interface Vulnerability {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  file: string;
  line?: number | null;
  description: string;
  explanation: string;
  codeBefore?: string | null;
  codeAfter?: string | null;
}

export interface QuickWin {
  id: string;
  title: string;
  impact: number;
  description: string;
}

export interface AnalysisResult {
  repoName: string;
  repoUrl: string;
  productionReadinessScore: number;
  buildVersion: string;
  testsPassed: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  vulnerabilities: Vulnerability[];
  quickWins: QuickWin[];
  executiveSummary: string;
  complexity: string;
  environment: string;
  timestamp: string;
  agentId: string;
  authLevel: string;
}

export interface AgentStatus {
  id: string;
  label: string;
  status: AgentState;
  task: string;
}

export type StreamEventType = 'agent' | 'log' | 'result' | 'error';

export interface StreamEvent {
  type: StreamEventType;
  agentId?: string;
  status?: AgentState;
  message?: string;
  data?: AnalysisResult;
  error?: string;
}
