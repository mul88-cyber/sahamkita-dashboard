import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SahamKita — Bandarmologi Intelligence',
    template: '%s | SahamKita',
  },
  description: 'Platform analisis saham Indonesia dengan Whale Detection, Crossing Nego Tracker, dan Ownership Intelligence.',
  keywords: ['saham', 'indonesia', 'whale detection', 'bandarmologi', 'trading', 'investasi', 'IHSG'],
  metadataBase: new URL('https://sahamkita-dashboard.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'SahamKita — Bandarmologi Intelligence',
    description: 'Deteksi pergerakan big player sebelum semua orang.',
    siteName: 'SahamKita',
  },
  themeColor: '#080d14',
}

export const viewport = {
  themeColor: '#080d14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} bg-base`}>
      <body className="min-h-screen bg-base font-sans">
        <ThemeProvider>
          <Sidebar />
          <div className="md:ml-[56px] transition-all duration-300 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
