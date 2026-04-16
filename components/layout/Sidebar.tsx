'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const mainNav = [
  { icon: '⊞', label: 'DASHBOARD', href: '/dashboard' },
  { icon: '⚠', label: 'VULNERABILITIES', href: '/dashboard#vulnerabilities' },
  { icon: '⊙', label: 'COMMIT_STREAM', href: null },
  { icon: '◎', label: 'NETWORK_MAP', href: null },
  { icon: '⚙', label: 'SETTINGS', href: null },
];

const footerNav = [
  { icon: '≡', label: 'DOCS', href: null },
  { icon: '?', label: 'SUPPORT', href: null },
];

interface SidebarProps {
  onInitiateScan?: () => void;
}

export default function Sidebar({ onInitiateScan }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-56 flex-shrink-0 bg-ta-surface-low border-r border-ta-border flex flex-col">
      {/* Main nav */}
      <nav className="flex-1 py-4">
        {mainNav.map(({ icon, label, href }) => {
          const isActive = href && pathname === href.split('#')[0];
          const isDisabled = !href;

          if (isDisabled) {
            return (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-2.5 opacity-30 cursor-not-allowed"
              >
                <span className="text-ta-text-muted text-sm w-4 text-center font-mono">{icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ta-text-muted">
                  {label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href!}
              className={[
                'flex items-center gap-3 px-4 py-2.5 transition-all duration-100 group',
                isActive
                  ? 'text-ta-cyan bg-ta-cyan/5 border-r-2 border-ta-cyan'
                  : 'text-ta-text-dim hover:text-ta-text hover:bg-ta-surface-mid',
              ].join(' ')}
            >
              <span className={['text-sm w-4 text-center font-mono', isActive ? 'text-ta-cyan' : 'text-ta-text-muted group-hover:text-ta-text'].join(' ')}>
                {icon}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Scan button */}
      <div className="px-4 py-3 border-t border-ta-border">
        <button
          onClick={() => onInitiateScan ? onInitiateScan() : router.push('/')}
          className="w-full py-2 bg-ta-cyan/10 border border-ta-cyan/30 text-ta-cyan font-mono text-[10px] uppercase tracking-widest hover:bg-ta-cyan/20 transition-colors"
        >
          INITIATE_SCAN
        </button>
      </div>

      {/* Footer nav */}
      <nav className="py-2 border-t border-ta-border">
        {footerNav.map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-2 opacity-40 cursor-not-allowed"
          >
            <span className="text-ta-text-muted text-sm w-4 text-center font-mono">{icon}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-ta-text-muted">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
