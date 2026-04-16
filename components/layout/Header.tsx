'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';

interface HeaderProps {
  onInitiateScan?: () => void;
  showScanButton?: boolean;
}

const navLinks = [
  { label: 'REPOS', href: '/' },
  { label: 'AUDITS', href: '/dashboard' },
  { label: 'LOGS', href: '/analyze' },
];

export default function Header({ onInitiateScan, showScanButton = true }: HeaderProps) {
  const pathname = usePathname();

  const screenLabel =
    pathname === '/' ? 'COMMAND_CENTER' :
    pathname === '/analyze' ? 'ANALYSIS_HUD' :
    pathname === '/dashboard' ? 'QA_DASHBOARD' : '';

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-ta-void border-b border-ta-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-ta-cyan font-mono text-sm font-bold tracking-widest select-none">
          TERMINAL_AUTHORITY
        </span>
        {screenLabel && (
          <span className="text-ta-text-muted font-mono text-xs tracking-widest hidden md:inline">
            // {screenLabel}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={[
              'px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors',
              pathname === href
                ? 'text-ta-cyan border border-ta-cyan/30 bg-ta-cyan/5'
                : 'text-ta-text-muted hover:text-ta-text border border-transparent',
            ].join(' ')}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-ta-text-muted font-mono text-[10px] uppercase tracking-widest">
            SOVEREIGN_AUDITOR
          </span>
        </div>
        <StatusBadge label="ONLINE" variant="online" />
        {showScanButton && (
          <Button
            size="sm"
            onClick={onInitiateScan}
            className="hidden md:inline-flex"
          >
            INITIATE_SCAN
          </Button>
        )}
      </div>
    </header>
  );
}
