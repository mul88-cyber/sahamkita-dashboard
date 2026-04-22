import './globals.css'
import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
