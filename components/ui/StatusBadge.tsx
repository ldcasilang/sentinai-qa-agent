interface StatusBadgeProps {
  label: string;
  variant?: 'online' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const variantStyles = {
  online: 'text-ta-cyan border-ta-cyan/30 bg-ta-cyan/5',
  warning: 'text-ta-amber border-ta-amber/30 bg-ta-amber/5',
  error: 'text-ta-red border-ta-red/30 bg-ta-red/5',
  neutral: 'text-ta-text-dim border-ta-border bg-ta-surface-mid',
};

export default function StatusBadge({ label, variant = 'online', className = '' }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono uppercase tracking-[0.12em]',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          variant === 'online' ? 'bg-ta-cyan animate-neon-pulse' :
          variant === 'warning' ? 'bg-ta-amber' :
          variant === 'error' ? 'bg-ta-red animate-neon-pulse' :
          'bg-ta-text-muted',
        ].join(' ')}
      />
      {label}
    </span>
  );
}
