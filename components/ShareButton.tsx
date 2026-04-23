// =============================================
// components/ShareButton.tsx
// Tombol share ke sosial media
// =============================================
'use client';

import { useState } from 'react';

interface ShareButtonProps {
  stockCode: string;
  title?: string;
}

export default function ShareButton({ stockCode, title }: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);

  const shareText = title || `Cek analisis saham ${stockCode} di SahamKita! 🐋📊`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        onClick={shareWhatsApp}
        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        title="Share via WhatsApp"
      >
        📱 WA
      </button>
      <button
        onClick={shareTwitter}
        className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
        title="Share via Twitter"
      >
        🐦 Tweet
      </button>
      <button
        onClick={shareTelegram}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        title="Share via Telegram"
      >
        ✈️ TG
      </button>
      <button
        onClick={handleCopyLink}
        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        title="Copy Link"
      >
        {showCopied ? '✅' : '📋'}
      </button>
    </div>
  );
}
