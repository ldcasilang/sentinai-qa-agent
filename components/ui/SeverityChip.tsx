import type { Severity } from '@/types';

interface SeverityChipProps {
  severity: Severity;
  className?: string;
}

const config: Record<Severity, { label: string; classes: string }> = {
  critical: {
    label: 'CRITICAL',
    classes: 'bg-ta-red-bg text-ta-red border-ta-red/50',
  },
  high: {
    label: 'HIGH',
    classes: 'bg-ta-amber/10 text-ta-amber border-ta-amber/50',
  },
  medium: {
    label: 'MEDIUM',
    classes: 'bg-ta-cyan/5 text-ta-cyan-dim border-ta-cyan/30',
  },
  low: {
    label: 'LOW',
    classes: 'bg-ta-surface-high text-ta-text-muted border-ta-border',
  },
};

export default function SeverityChip({ severity, className = '' }: SeverityChipProps) {
  const { label, classes } = config[severity];
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-[0.15em]',
        classes,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
