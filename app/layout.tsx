// =============================================
// app/layout.tsx - FINAL VERSION
// =============================================
import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'SahamKita - Bandarmologi Intelligence Dashboard',
    template: '%s | SahamKita',
  },
  description: 'Platform analisis saham Indonesia dengan Whale Detection, Crossing Nego Tracker, dan Ownership Data. Deteksi pergerakan big player sebelum semua orang.',
  keywords: ['saham', 'indonesia', 'whale detection', 'bandarmologi', 'trading', 'investasi', 'idx', 'bei'],
  authors: [{ name: 'SahamKita' }],
  creator: 'SahamKita',
  metadataBase: new URL('https://sahamkita-dashboard.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://sahamkita-dashboard.vercel.app',
    title: 'SahamKita - Bandarmologi Intelligence Dashboard',
    description: 'Deteksi pergerakan big player sebelum semua orang.',
    siteName: 'SahamKita',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SahamKita - Bandarmologi Intelligence',
    description: 'Deteksi pergerakan big player sebelum semua orang.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
