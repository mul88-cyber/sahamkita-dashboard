// =============================================
// components/AccumulationScore.tsx
// Score Akumulasi/Distribusi berdasarkan multi-indikator
// =============================================
interface AccScoreProps {
  whaleSignal: boolean;
  splitSignal: boolean;
  netForeignFlow: number;
  bidOfferImbalance: number;
  changePercent: number;
  volumeSpike: number;
}

export default function AccumulationScore({
  whaleSignal,
  splitSignal,
  netForeignFlow,
  bidOfferImbalance,
  changePercent,
  volumeSpike,
}: AccScoreProps) {
  let score = 50; // Neutral
  
  if (whaleSignal) score += 20;
  if (splitSignal) score -= 20;
  if (netForeignFlow > 0) score += 10;
  if (netForeignFlow < 0) score -= 10;
  if (bidOfferImbalance > 0.3) score += 10;
  if (bidOfferImbalance < -0.3) score -= 10;
  if (changePercent > 0 && volumeSpike > 2) score += 10;
  if (changePercent < 0 && volumeSpike > 2) score -= 10;
  
  score = Math.max(0, Math.min(100, score));
  
  const getLabel = () => {
    if (score >= 80) return { text: '🔥 Strong Accumulation', color: 'text-green-700', bg: 'bg-green-100' };
    if (score >= 60) return { text: '📈 Accumulation', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 40) return { text: '⚖️ Neutral', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (score >= 20) return { text: '📉 Distribution', color: 'text-red-600', bg: 'bg-red-50' };
    return { text: '💀 Strong Distribution', color: 'text-red-700', bg: 'bg-red-100' };
  };
  
  const label = getLabel();
  
  return (
    <div className={`rounded-lg p-4 ${label.bg} border`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">Accumulation Score</p>
        <p className={`text-xl font-bold ${label.color}`}>{label.text}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            score >= 60 ? 'bg-green-500' : score >= 40 ? 'bg-gray-400' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>Score: {score}</span>
        <span>100</span>
      </div>
    </div>
  );
}
