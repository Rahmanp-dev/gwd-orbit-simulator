import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import ServiceWorkerKiller from '@/components/ServiceWorkerKiller';

// ── Type system ───────────────────────────────────────────────
// Geist        → body + display (one cohesive geometric sans; clean & modern)
// Geist Mono   → numerals, labels, code
const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: 'GWD Orbit — BizSim 2026',
  description: "India's first live business simulation. 9 days. Real leads. Real deals. ₹1.2 Lakh prize pool. Close real clients, earn real commissions.",
  keywords: ['GWD Orbit', 'BizSim 2026', 'sales hackathon', 'Hyderabad', 'freelance', 'business simulation', 'GWD Global'],
  authors: [{ name: 'GWD Global Pvt Ltd', url: 'https://yourgwd.com' }],
  openGraph: {
    type: 'website',
    title: 'GWD Orbit — BizSim 2026',
    description: "India's first live business simulation. 9 days. Real leads. Real deals. ₹1.2 Lakh prize pool.",
    siteName: 'GWD Orbit',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GWD Orbit BizSim 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GWD Orbit — BizSim 2026',
    description: "India's first live business simulation. Close real deals. Win real money.",
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="antialiased bg-[var(--bg)] text-[var(--ink)]">
        <Providers>
          <ServiceWorkerKiller />
          {children}
        </Providers>
      </body>
    </html>
  );
}
