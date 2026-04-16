'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-ta-cyan text-ta-void hover:bg-ta-cyan-glow active:opacity-80 shadow-cyan-glow font-bold tracking-widest',
  danger: 'bg-ta-red-bg text-ta-red border border-ta-red hover:bg-ta-red hover:text-ta-void shadow-red-glow font-bold tracking-widest',
  ghost: 'bg-transparent text-ta-text-dim hover:text-ta-cyan hover:bg-ta-surface-low font-mono tracking-widest',
  outline: 'bg-transparent border border-ta-border text-ta-text hover:border-ta-cyan hover:text-ta-cyan font-mono tracking-widest',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-xs',
  lg: 'px-8 py-3.5 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center gap-2 transition-all duration-100 uppercase',
          'disabled:opacity-30 disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
