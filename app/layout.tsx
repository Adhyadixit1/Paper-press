import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Footer, Header } from './SiteChrome';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
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
        <Footer />
      </body>
    </html>
  );
}
