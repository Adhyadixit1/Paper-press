import type { Metadata } from 'next';
import Script from 'next/script';
import {Suspense} from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Footer, Header } from './SiteChrome';
import WhatsAppSticky from './WhatsAppSticky';
import VisitorAnalytics from './VisitorAnalytics';
import {siteUrl,JsonLd} from '../lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const GA_MEASUREMENT_ID = 'G-E9S35LT1ZM';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Paper & Press — Print Packaging Possibilities',
  description: 'Premium custom print and packaging, beautifully made for ambitious brands.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/brand-mark.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/brand-mark.png', sizes: '512x512', type: 'image/png' }],
  },
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
      <head>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5PGTKV6S');`}
        </Script>
        <Script
          id="google-analytics-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-config" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_MEASUREMENT_ID}',{send_page_view:true});`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5PGTKV6S"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Header />
        <JsonLd data={{'@context':'https://schema.org','@type':'Organization',name:'Paper & Press',url:siteUrl,logo:siteUrl+'/brand/brand-mark.png',telephone:'+918824622541',address:{'@type':'PostalAddress',addressLocality:'Jaipur',addressRegion:'Rajasthan',addressCountry:'IN'}}}/>
        <Suspense fallback={null}><VisitorAnalytics/></Suspense>
        {children}
        <WhatsAppSticky />
        <Footer />
      </body>
    </html>
  );
}
