interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: 'cyan' | 'amber' | 'red';
  showPercent?: boolean;
  className?: string;
}

const variantBar = {
  cyan: 'bg-ta-cyan',
  amber: 'bg-ta-amber',
  red: 'bg-ta-red',
};

export default function ProgressBar({
  value,
  label,
  variant = 'cyan',
  showPercent = true,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const blocks = Math.round(clamped / 5); // 20 blocks total

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-ta-text-muted">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-[10px] font-mono text-ta-text-dim">{clamped}%</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={[
              'h-1.5 flex-1 transition-all duration-300',
              i < blocks ? variantBar[variant] : 'bg-ta-surface-high',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
