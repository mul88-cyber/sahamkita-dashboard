// =============================================
// components/AddToWatchlistButton.tsx
// Button untuk tambah/hapus watchlist
// =============================================
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';

interface AddToWatchlistButtonProps {
  stockCode: string;
}

export default function AddToWatchlistButton({ stockCode }: AddToWatchlistButtonProps) {
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkWatchlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('watchlist')
          .select('stock_code')
          .eq('stock_code', stockCode)
          .single();
        
        setIsInWatchlist(!!data);
      }
      setLoading(false);
    };

    checkWatchlist();
  }, [stockCode]);

  const handleToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=/emiten/${stockCode}`);
      return;
    }

    setLoading(true);

    if (isInWatchlist) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('stock_code', stockCode);
      setIsInWatchlist(false);
    } else {
      await supabase
        .from('watchlist')
        .insert({ stock_code: stockCode });
      setIsInWatchlist(true);
    }

    setLoading(false);
    router.refresh();
  };

  if (loading) {
    return (
      <button disabled className="px-3 py-1.5 text-sm bg-gray-200 text-gray-500 rounded-lg">
        ⭐ Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
        isInWatchlist
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{isInWatchlist ? '⭐' : '☆'}</span>
      <span>{isInWatchlist ? 'Saved' : 'Watchlist'}</span>
    </button>
  );
}
