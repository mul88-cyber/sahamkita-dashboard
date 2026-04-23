// =============================================
// app/error.tsx
// Error boundary untuk seluruh aplikasi
// =============================================
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔥</div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-600 mb-2">
          {error.message || 'Gagal memuat halaman.'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Jika masalah berlanjut, silakan refresh halaman atau hubungi support.
        </p>
      </div>
    </div>
  );
}
