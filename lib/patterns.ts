// =============================================
// lib/patterns.ts
// Deteksi pola candlestick
// =============================================

interface CandlePattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  reliability: 'high' | 'medium' | 'low';
  description: string;
}

export function detectPatterns(candles: Array<{
  open: number;
  high: number;
  low: number;
  close: number;
}>): CandlePattern[] {
  const patterns: CandlePattern[] = [];
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  if (!last || !prev) return patterns;

  const body = Math.abs(last.close - last.open);
  const totalRange = last.high - last.low;
  const upperWick = last.high - Math.max(last.open, last.close);
  const lowerWick = Math.min(last.open, last.close) - last.low;
  
  // Doji
  if (totalRange > 0 && body / totalRange < 0.1) {
    patterns.push({
      name: 'Doji',
      type: 'neutral',
      reliability: 'medium',
      description: 'Keraguan pasar. Potensi reversal.'
    });
  }
  
  // Hammer
  if (lowerWick > body * 2 && upperWick < body * 0.3 && last.close > last.open) {
    patterns.push({
      name: 'Hammer',
      type: 'bullish',
      reliability: 'high',
      description: 'Potensi reversal bullish setelah downtrend.'
    });
  }
  
  // Shooting Star
  if (upperWick > body * 2 && lowerWick < body * 0.3 && last.close < last.open) {
    patterns.push({
      name: 'Shooting Star',
      type: 'bearish',
      reliability: 'high',
      description: 'Potensi reversal bearish setelah uptrend.'
    });
  }
  
  // Bullish Engulfing
  if (prev.close < prev.open && last.close > last.open && 
      last.open < prev.close && last.close > prev.open) {
    patterns.push({
      name: 'Bullish Engulfing',
      type: 'bullish',
      reliability: 'high',
      description: 'Sinyal kuat reversal bullish.'
    });
  }
  
  // Bearish Engulfing
  if (prev.close > prev.open && last.close < last.open && 
      last.open > prev.close && last.close < prev.open) {
    patterns.push({
      name: 'Bearish Engulfing',
      type: 'bearish',
      reliability: 'high',
      description: 'Sinyal kuat reversal bearish.'
    });
  }
  
  // Marubozu
  if (body / totalRange > 0.9 && last.close > last.open) {
    patterns.push({
      name: 'Bullish Marubozu',
      type: 'bullish',
      reliability: 'medium',
      description: 'Tekanan beli sangat kuat sepanjang hari.'
    });
  } else if (body / totalRange > 0.9 && last.close < last.open) {
    patterns.push({
      name: 'Bearish Marubozu',
      type: 'bearish',
      reliability: 'medium',
      description: 'Tekanan jual sangat kuat sepanjang hari.'
    });
  }
  
  return patterns;
}
