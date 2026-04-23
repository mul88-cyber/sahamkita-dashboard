// =============================================
// types/index.ts
// TypeScript type definitions untuk SahamKita
// =============================================

export interface Stock {
  stock_code: string;
  close: number;
  change_percent: number;
  volume: number;
  net_foreign_flow: number;
  big_player_anomaly: boolean;
  final_signal: string;
  sector: string;
  trading_date: string;
  
  // 🆕 METRIK WHALE DETECTION
  aov_ratio?: number;
  whale_signal?: boolean;
  split_signal?: boolean;
  conviction_score?: number;
  avg_order_volume?: number;
  ma50_avg_order_volume?: number;
  transaction_value?: number;
  foreign_buy?: number;
  foreign_sell?: number;
  free_float?: number;
}

export interface DashboardStats {
  top_gainer: Stock[] | null;
  top_loser: Stock[] | null;
  top_volume: Stock[] | null;
  total_net_foreign: number;
  anomaly_count: number;
  
  // 🆕 STATISTIK WHALE
  top_whale?: Stock[] | null;
  whale_count?: number;
  split_count?: number;
}

export interface DashboardClientProps {
  initialStocks: Stock[];
  initialStats: DashboardStats;
  sectors: string[];
  lastDate: string;
  totalCount: number;
}

export interface FilterState {
  search: string;
  sector: string;
  anomalyOnly: boolean;
  signal: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  stock_code: string;
  added_at: string;
  notes?: string;
  alert_threshold?: number;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  stock_code: string;
  target_price: number;
  condition: 'above' | 'below';
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
}

export type Currency = 'IDR' | 'USD';

export type MarketSector = 
  | 'ENERGY' 
  | 'FINANCIAL' 
  | 'TECHNOLOGY' 
  | 'CONSUMER' 
  | 'INFRASTRUCTURE'
  | 'PROPERTY'
  | 'MINING'
  | 'AGRICULTURE'
  | 'OTHER';
