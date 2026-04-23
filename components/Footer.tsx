// =============================================
// components/Footer.tsx
// Footer untuk semua halaman
// =============================================
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">📈 SahamKita</h3>
            <p className="text-sm text-gray-600">
              Platform Bandarmologi Intelligence untuk analisis saham Indonesia.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Fitur</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-blue-600">Dashboard</Link></li>
              <li><Link href="/screener" className="hover:text-blue-600">Screener</Link></li>
              <li><Link href="/watchlist" className="hover:text-blue-600">Watchlist</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
              <li><a href="mailto:admin@sahamkita.com" className="hover:text-blue-600">Kontak</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Disclaimer</h4>
            <p className="text-xs text-gray-500">
              SahamKita tidak bertanggung jawab atas keputusan investasi. 
              Data yang disajikan bersifat informatif dan bukan rekomendasi beli/jual.
            </p>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-4 text-center text-sm text-gray-500">
          © 2026 SahamKita. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
