// =============================================
// app/profile/page.tsx
// Halaman Profil User
// =============================================
import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // Ambil data watchlist count
  const { count: watchlistCount } = await supabase
    .from('watchlist')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">👤 Profil Saya</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              {user.email?.[0]?.toUpperCase() || '👤'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.user_metadata?.full_name || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Member Sejak</p>
              <p className="font-semibold">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Watchlist</p>
              <p className="font-semibold">{watchlistCount || 0} Saham</p>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">🆓 Plan Gratis</h3>
              <p className="text-sm text-gray-600 mt-1">
                Watchlist max 5 saham • Screener Basic
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Upgrade ke Premium
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">⚡ Quick Links</h3>
          <div className="space-y-2">
            <Link href="/watchlist" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              ⭐ Watchlist Saya ({watchlistCount || 0} saham)
            </Link>
            <Link href="/pricing" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              💎 Lihat Pricing
            </Link>
          </div>
        </div>

        {/* Logout */}
        <form action="/auth/signout" method="post" className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </form>
      </main>
    </div>
  );
}
