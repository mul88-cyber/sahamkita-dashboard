// =============================================
// app/layout.tsx - SIDEBAR + DARK MODE VERSION
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

other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
  },
};
