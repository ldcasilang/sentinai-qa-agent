interface MetricCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  className?: string;
}

const variantBorder = {
  default: 'border-ta-border',
  critical: 'border-ta-red/40 shadow-red-glow',
  warning: 'border-ta-amber/40 shadow-amber-glow',
  success: 'border-ta-cyan/40 shadow-cyan-glow',
};

const variantText = {
  default: 'text-ta-text',
  critical: 'text-ta-red',
  warning: 'text-ta-amber',
  success: 'text-ta-cyan',
};

export default function MetricCard({ label, value, variant = 'default', className = '' }: MetricCardProps) {
  return (
    <div
      className={[
        'bg-ta-surface-mid border p-4 flex flex-col gap-1 min-w-[120px]',
        variantBorder[variant],
        className,
      ].join(' ')}
    >
      <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-ta-text-muted">
        {label}
      </span>
      <span className={['text-xl font-mono font-bold tabular-nums', variantText[variant]].join(' ')}>
        {value}
      </span>
    </div>
  );
}
