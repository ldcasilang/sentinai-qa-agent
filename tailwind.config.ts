import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ta: {
          // Surface hierarchy (dark to bright)
          void: '#0B0E11',
          bg: '#111417',
          'surface-low': '#191c1f',
          'surface-mid': '#1d2023',
          'surface-high': '#272a2e',
          'surface-top': '#323538',
          'surface-bright': '#37393d',
          // Signal colors
          cyan: '#00F5FF',
          'cyan-dim': '#00DCE5',
          'cyan-glow': '#63F7FF',
          amber: '#FFAE0E',
          'amber-dim': '#FFBA4B',
          red: '#FF3131',
          'red-bg': '#93000A',
          // Text
          text: '#E1E2E7',
          'text-dim': '#B9CACA',
          'text-muted': '#849495',
          border: '#3A494A',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'cursor-blink': 'cursor-blink 500ms step-end infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 245, 255, 0.15)',
        'red-glow': '0 0 20px rgba(255, 49, 49, 0.15)',
        'amber-glow': '0 0 20px rgba(255, 174, 14, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
