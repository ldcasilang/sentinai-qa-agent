import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SentinAI — Terminal Authority QA Agent',
  description: 'AI-powered GitHub repository security and quality auditor',
  robots: 'noindex',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[
        jetbrainsMono.variable,
        spaceGrotesk.variable,
        inter.variable,
      ].join(' ')}
    >
      <body className="font-mono antialiased h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
