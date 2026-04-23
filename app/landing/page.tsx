// =============================================
// app/landing/page.tsx
// Landing Page / Homepage Marketing
// =============================================
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Deteksi Pergerakan <span className="text-yellow-300">Big Player</span> Sebelum Semua Orang
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Platform Bandarmologi Intelligence pertama di Indonesia. 
                Lacak Whale, Crossing Nego, dan Struktur Kepemilikan Saham dalam satu dashboard.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-300 transition-colors font-bold"
                >
                  Mulai Gratis →
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Lihat Dashboard
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm text-blue-200">
                <span>✅ No Credit Card</span>
                <span>✅ Free Forever</span>
                <span>✅ Update Harian</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🐋</span>
                    <div>
                      <p className="font-bold">Whale Detection</p>
                      <p className="text-sm text-blue-200">Deteksi akumulasi big player</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏦</span>
                    <div>
                      <p className="font-bold">Crossing Nego</p>
                      <p className="text-sm text-blue-200">Lacak transaksi pasar nego</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    <div>
                      <p className="font-bold">Orderbook Analysis</p>
                      <p className="text-sm text-blue-200">Analisis supply-demand</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>
                    <div>
                      <p className="font-bold">Ownership Data</p>
                      <p className="text-sm text-blue-200">Struktur kepemilikan saham</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan SahamKita
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tools lengkap untuk analisis bandarmologi dan trader flow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🐋</div>
              <h3 className="text-xl font-bold mb-2">Whale Detection</h3>
              <p className="text-gray-600">
                Deteksi akumulasi big player dengan AOV Ratio ≥ 1.5x. 
                Conviction Score 0-99% untuk confidence level.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🕯️</div>
              <h3 className="text-xl font-bold mb-2">Candlestick Pro</h3>
              <p className="text-gray-600">
                Chart candlestick interaktif dengan VWMA 20D, Typical Price, 
                dan Volume overlay.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Advanced Screener</h3>
              <p className="text-gray-600">
                Filter saham berdasarkan Whale Signal, Split Signal, 
                Crossing Nego, dan Saham Ringan.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2">Ownership Data</h3>
              <p className="text-gray-600">
                Lihat struktur kepemilikan saham: Institusi, Ritel, Asing. 
                Update bulanan dari KSEI.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Personal Watchlist</h3>
              <p className="text-gray-600">
                Simpan saham favorit, pantau pergerakan, dan dapatkan 
                sinyal whale langsung di watchlist.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">
                Akses dari mana saja. Responsive design yang nyaman 
                di desktop dan smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">600+</p>
              <p className="text-gray-600 mt-2">Saham Tercakup</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">45+</p>
              <p className="text-gray-600 mt-2">Metrik Analisis</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">30H</p>
              <p className="text-gray-600 mt-2">Data Historis</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">Daily</p>
              <p className="text-gray-600 mt-2">Update Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Siap Deteksi Pergerakan Big Player?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Daftar gratis sekarang dan dapatkan akses ke dashboard Bandarmologi.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-300 transition-colors font-bold"
            >
              Daftar Gratis →
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
            >
              Lihat Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
