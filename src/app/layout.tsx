import type { Metadata } from "next";
import { Geist, Geist_Mono, Cardo } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
