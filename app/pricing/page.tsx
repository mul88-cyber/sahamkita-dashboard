// =============================================
// app/pricing/page.tsx
// Halaman Pricing untuk Monetisasi
// =============================================
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Gratis',
      price: 'Rp 0',
      period: '/selamanya',
      color: 'bg-gray-50 border-gray-300',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      features: [
        'Dashboard Utama',
        'Detail Emiten (30 Hari)',
        'Candlestick Chart',
        'Screener Basic',
        'Watchlist (Max 5 Saham)',
        'Orderbook Analysis',
      ],
      notIncluded: [
        'Screener Advanced',
        'Watchlist Unlimited',
        'Ownership Deep Dive',
        'Price Alert',
        'Export Data',
        'Priority Support',
      ],
    },
    {
      name: 'Premium',
      price: 'Rp 99.000',
      period: '/bulan',
      popular: true,
      color: 'bg-gradient-to-b from-blue-50 to-indigo-50 border-blue-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Semua Fitur Gratis',
        'Screener Advanced',
        'Watchlist Unlimited',
        'Ownership Deep Dive',
        'Price Alert (Email)',
        'Export Data (CSV)',
        'Candlestick Pattern Detection',
        'Crossing Nego Alert',
        'Whale Accumulation Tracker',
        'Priority Support',
      ],
      notIncluded: [],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      color: 'bg-gradient-to-b from-purple-50 to-pink-50 border-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      features: [
        'Semua Fitur Premium',
        'API Access',
        'Custom Dashboard',
        'White Label',
        'Multi User',
        'Dedicated Support',
        'SLA Guarantee',
        'Custom Integration',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💎 Pilih Plan Anda
          </h1>
          <p className="text-lg text-gray-600">
            Upgrade untuk fitur eksklusif Bandarmologi Intelligence
          </p>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl shadow-lg p-8 border-2 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  🔥 Paling Populer
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✅</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">❌</span>
                    <span className="text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === 'Enterprise' ? 'mailto:admin@sahamkita.com' : '/register'}
                className={`block w-full text-center py-3 rounded-lg text-white font-medium transition-colors ${plan.buttonColor}`}
              >
                {plan.name === 'Gratis' ? 'Mulai Gratis' : 
                 plan.name === 'Enterprise' ? 'Hubungi Kami' : 'Upgrade Sekarang'}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">❓ FAQ</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold mb-2">Apa itu Whale Detection?</h3>
              <p className="text-gray-600 text-sm">
                Whale Detection adalah sistem deteksi akumulasi big player berdasarkan 
                Average Order Volume (AOV) Ratio. Jika AOV Ratio ≥ 1.5x MA50, 
                terindikasi ada whale yang sedang mengakumulasi saham.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold mb-2">Bagaimana cara upgrade ke Premium?</h3>
              <p className="text-gray-600 text-sm">
                Klik tombol "Upgrade Sekarang" di plan Premium, Anda akan diarahkan 
                ke halaman pembayaran. Pembayaran via Stripe (Credit Card, GoPay, OVO).
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold mb-2">Apakah data diupdate setiap hari?</h3>
              <p className="text-gray-600 text-sm">
                Ya! Data transaksi diupdate setiap hari setelah pasar tutup. 
                Data kepemilikan (shareholders) diupdate setiap bulan.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Masih ragu? Coba gratis dulu!
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Daftar Gratis Sekarang →
          </Link>
        </div>
      </main>
    </div>
  );
}
