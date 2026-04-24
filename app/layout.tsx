// =============================================
// app/layout.tsx - FIXED
// =============================================
import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'SahamKita - Bandarmologi Intelligence Dashboard',
    template: '%s | SahamKita',
  },
  description: 'Platform analisis saham Indonesia dengan Whale Detection, Crossing Nego Tracker, dan Ownership Data.',
  keywords: ['saham', 'indonesia', 'whale detection', 'bandarmologi', 'trading', 'investasi'],
  metadataBase: new URL('https://sahamkita-dashboard.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'SahamKita - Bandarmologi Intelligence Dashboard',
    description: 'Deteksi pergerakan big player sebelum semua orang.',
    siteName: 'SahamKita',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <ThemeProvider>
          <Sidebar />
          <div className="md:ml-16 transition-all duration-300 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
