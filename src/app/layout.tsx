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
  keywords: "hormone health, menopause, perimenopause, women's health, South Africa, telemedicine, medical aid",
  authors: [{ name: "HHWH Online Clinic" }],
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
  openGraph: {
    title: "HHWH Online Clinic - Women's Hormone Health",
    description: "Expert hormone health care for South African women",
    type: "website",
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
