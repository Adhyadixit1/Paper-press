import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Footer, Header } from './SiteChrome';
import WhatsAppSticky from './WhatsAppSticky';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  ),
  title: 'Paper & Press — Print Packaging Possibilities',
  description: 'Premium custom print and packaging, beautifully made for ambitious brands.',
  openGraph: { title: 'Paper & Press', description: 'Print • Packaging • Possibilities', type: 'website', images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Paper & Press — Print Packaging Possibilities' }] },
  twitter: { card: 'summary_large_image', title: 'Paper & Press', description: 'Print • Packaging • Possibilities', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <WhatsAppSticky />
        <Footer />
      </body>
    </html>
  );
}
