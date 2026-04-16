import { repoCache } from './cache';

const ALLOWED_EXTENSIONS = new Set([
  '.js', '.ts', '.tsx', '.jsx', '.py', '.go', '.java', '.rb', '.php',
  '.vue', '.svelte', '.css', '.scss', '.html', '.json', '.yaml', '.yml',
  '.sh', '.env.example', '.prisma', '.graphql',
]);

const IGNORED_DIRS = new Set([
  'node_modules', 'dist', 'build', '.next', 'out', 'coverage',
  '__pycache__', '.git', 'vendor', '.cache', '.turbo', 'public',
  '.vercel', 'tmp', 'temp', 'logs',
]);

const MAX_FILE_SIZE = 80 * 1024;   // 80 KB per file
const MAX_FILES = 12;
const MAX_TOTAL_CHARS = 70 * 1024; // 70 KB combined

interface GitHubTreeItem {
  path: string;
  type: string;
  size: number;
  url: string;
  sha: string;
}

interface GitHubRepoInfo {
  default_branch: string;
  name: string;
  full_name: string;
}

interface GitHubTree {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export function isGitHubURL(url: string): boolean {
  return /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url);
}

export function parseGitHubURL(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function githubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'SentinAI-QA-Agent/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function githubFetch(path: string, token?: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, { headers: githubHeaders(token) });
}

function classifyGitHubError(status: number): string {
  switch (status) {
    case 401: return 'Invalid or expired GitHub token. Check your token and try again.';
    case 403: return 'Access forbidden. For private repos, provide a GitHub token with "repo" scope.';
    case 404: return 'Repository not found. Check the URL and ensure you have access.';
    case 429: return 'GitHub API rate limit exceeded. Try again in a few minutes.';
    default: return `GitHub API error (${status}). Try again later.`;
  }
}

function hasAllowedExtension(path: string): boolean {
  const parts = path.split('.');
  if (parts.length < 2) return false;
  const ext = '.' + parts[parts.length - 1];
  // Special case for .env.example
  if (path.endsWith('.env.example')) return true;
  return ALLOWED_EXTENSIONS.has(ext);
}

function isIgnored(path: string): boolean {
  return path.split('/').some(segment => IGNORED_DIRS.has(segment));
}

export async function fetchRepoCode(repoUrl: string, token?: string): Promise<{ code: string; fileCount: number; repoName: string }> {
  const cacheKey = `${repoUrl}:${token ?? 'public'}`;
  const cached = repoCache.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed;
  }

  const parsed = parseGitHubURL(repoUrl);
  if (!parsed) throw new Error('Invalid GitHub URL');
  const { owner, repo } = parsed;

  // Fetch repo metadata
  const repoRes = await githubFetch(`/repos/${owner}/${repo}`, token);
  if (!repoRes.ok) throw new Error(classifyGitHubError(repoRes.status));
  const repoInfo = await repoRes.json() as GitHubRepoInfo;
  const branch = repoInfo.default_branch;

  // Fetch file tree
  const treeRes = await githubFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, token);
  if (!treeRes.ok) throw new Error(`Failed to fetch repository tree: ${classifyGitHubError(treeRes.status)}`);
  const treeData = await treeRes.json() as GitHubTree;

  // Filter and prioritize files
  const candidates = treeData.tree
    .filter(item => item.type === 'blob' && item.size < MAX_FILE_SIZE && !isIgnored(item.path) && hasAllowedExtension(item.path))
    .sort((a, b) => {
      // Prioritize: root files, src/ files, smaller files
      const aRoot = !a.path.includes('/') ? -1 : 0;
      const bRoot = !b.path.includes('/') ? -1 : 0;
      return aRoot - bRoot || a.size - b.size;
    })
    .slice(0, MAX_FILES);

  // Fetch file contents in parallel
  const contentResults = await Promise.allSettled(
    candidates.map(async (file) => {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
      const res = await fetch(rawUrl, { headers: githubHeaders(token) });
      if (!res.ok) return null;
      const text = await res.text();
      return `// ═══ FILE: ${file.path} ═══\n${text}`;
    })
  );

  const sections = contentResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);

  const code = sections.join('\n\n').slice(0, MAX_TOTAL_CHARS);
  const result = { code, fileCount: sections.length, repoName: repoInfo.full_name };

  repoCache.set(cacheKey, JSON.stringify(result));
  return result;
}
