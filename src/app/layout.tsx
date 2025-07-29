import type { Metadata } from "next";
import { Geist, Geist_Mono, Cardo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalNavigation from '@/components/navigation/ConditionalNavigation';
import Footer from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cardoFont = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HHWH Online Clinic - Women's Hormone Health",
  description: "Accessible, expert hormone health care for South African women through virtual consultations and personalized treatment plans.",
  keywords: "hormone health, menopause, perimenopause, women's health, South Africa, telemedicine, medical aid, healthcare, online consultation, virtual doctor",
  authors: [{ name: "HHWH Online Clinic" }],
  publisher: "HHWH Online Clinic",
  creator: "HHWH Online Clinic",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/images/favicon/favicon.ico' },
    ],
  },
  manifest: '/images/favicon/site.webmanifest',
  other: {
    // Security Headers
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // Mobile & PWA
    'theme-color': '#368489',
    'msapplication-navbutton-color': '#368489',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'HHWH Clinic',
    'mobile-web-app-capable': 'yes',
    'application-name': 'HHWH Online Clinic',
    
    // Microsoft
    'msapplication-TileColor': '#368489',
    'msapplication-config': '/images/favicon/browserconfig.xml',
    'msapplication-tooltip': 'HHWH Online Clinic - Women\'s Hormone Health',
    'msapplication-starturl': '/',
    
    // Corporate Network Friendly
    'format-detection': 'telephone=no',
    'apple-touch-fullscreen': 'yes',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
    
    // Content Classification
    'rating': 'general',
    'revisit-after': '7 days',
    'distribution': 'global',
    'coverage': 'worldwide',
    'target': 'all',
    'audience': 'all',
    'subject': 'Healthcare, Women\'s Health, Telemedicine',
    'classification': 'Healthcare Services',
    'category': 'Health & Medical',
  },
  openGraph: {
    title: "HHWH Online Clinic - Women's Hormone Health",
    description: "Expert hormone health care for South African women through virtual consultations and personalized treatment plans.",
    type: "website",
    siteName: "HHWH Online Clinic",
    locale: "en_ZA",
    images: [
      {
        url: '/images/Logo-HHWH.png',
        width: 1200,
        height: 630,
        alt: 'HHWH Online Clinic Logo'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HHWH Online Clinic - Women's Hormone Health",
    description: "Expert hormone health care for South African women",
    images: ['/images/Logo-HHWH.png'],
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://hhwh.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cardoFont.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <ConditionalNavigation />
            <ScrollProgress />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid rgb(229, 231, 235)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                className: 'shadow-lg',
              }}
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
