import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'  // 🆕 TAMBAH

export const metadata: Metadata = {
  title: 'SahamKita - Dashboard Kepemilikan Saham Indonesia',
  description: 'Analisis kepemilikan saham perusahaan publik Indonesia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />  {/* 🆕 TAMBAH */}
      </body>
    </html>
  )
}
