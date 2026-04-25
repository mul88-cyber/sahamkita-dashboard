'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ---- Formatters ----
const fmt = {
  currency: (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0),
  volume: (v: number) => {
    if (!v) return '0';
    if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    return v.toLocaleString('id-ID');
  },
  pct: (v: number) => `${v >= 0 ? '+' : ''}${v?.toFixed(2)}%`,
  date: (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  shortDate: (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
};

// ---- SVG Icons ----
function IconArrowUp({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M2 5L5 2L8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconArrowDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M5 2V8M2 5L5 8L8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconChevronRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconExternalLink({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M4 2H2a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 1h3m0 0v3m0-3L5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconWave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8c1-2 2-2 3 0s2 2 3 0 2-2 3 0 2 2 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline points="1,7 4,4 6,9 9,3 11,7 13,5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
function IconFish() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7c2-3 5-4 8-3l2-2v5l-2-1c-3 1-6 0-8-1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="6" r="0.8" fill="currentColor"/>
    </svg>
  );
}

// ---- Mini Sparkline SVG (deterministic from values) ----
function Sparkline({
  values,
  color,
  width = 60,
  height = 24,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');
  const lastY = height - ((values[values.length - 1] - min) / range) * height;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <circle cx={(values.length - 1) * step} cy={lastY} r="2.5" fill={color} opacity="0.9"/>
    </svg>
  );
}

// ---- Breadth Arc (semicircle gauge) ----
function BreadthGauge({ pct }: { pct: number }) {
  const r = 52;
  const cx = 70;
  const cy = 60;
  const circumference = Math.PI * r;
  const bullDash = (pct / 100) * circumference;
  const bearDash = ((100 - pct) / 100) * circumference;
  const needleAngle = -180 + (pct / 100) * 180;
  const rad = (needleAngle * Math.PI) / 180;
  const nx = cx + (r - 6) * Math.cos(rad);
  const ny = cy + (r - 6) * Math.sin(rad);
  return (
    <svg width="140" height="72" viewBox="0 0 140 72">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Bear arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--color-bear)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset="0"
        opacity="0.3"
      />
      {/* Bull arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--color-bull)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${bullDash} ${circumference}`}
        strokeDashoffset="0"
        opacity="0.9"
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx={cx} cy={cy} r="3" fill="white" opacity="0.6"/>
    </svg>
  );
}

// ---- HorizontalBar for sectors ----
function SectorRow({ name, count, total, rank }: { name: string; count: number; total: number; rank: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const isTop = rank <= 3;
  return (
    <div className="flex items-center gap-3 group">
      <span
        className="w-4 text-[9px] font-mono text-right shrink-0"
        style={{ color: 'var(--color-text-ghost)' }}
      >
        {rank}
      </span>
      <div className="w-24 shrink-0">
        <p className="text-[11px] font-medium truncate leading-none" style={{ color: isTop ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
          {name}
        </p>
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isTop
              ? 'linear-gradient(90deg, var(--color-accent), rgba(0,196,255,0.6))'
              : 'var(--color-text-ghost)',
          }}
        />
      </div>
      <span className="w-7 text-right font-mono text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {count}
      </span>
    </div>
  );
}

// ---- Stock Row — table-style ----
function StockRow({ rank, stock, type }: { rank: number; stock: any; type: 'gainer' | 'loser' }) {
  const isBull = type === 'gainer';
  const color = isBull ? 'var(--color-bull)' : 'var(--color-bear)';
  const dimColor = isBull ? 'var(--color-bull-dim)' : 'var(--color-bear-dim)';
  return (
    <Link
      href={`/emiten/${stock.stock_code}`}
      className="stock-row flex items-center gap-2.5 px-3 py-2.5 transition-all group"
    >
      {/* Rank badge */}
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[9px] font-mono font-bold"
        style={{ background: dimColor, color }}
      >
        {rank}
      </div>

      {/* Code */}
      <div className="w-14 shrink-0">
        <p className="font-mono font-black text-[13px] leading-none" style={{ color }}>
          {stock.stock_code}
        </p>
        <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--color-text-ghost)' }}>
          {stock.sector?.split(' ')[0] || '—'}
        </p>
      </div>

      {/* Inline mini sparkline placeholder — price */}
      <div className="flex-1 min-w-0">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(Math.abs(stock.change_percent || 0) * 8, 100)}%`,
              background: color,
              opacity: 0.6,
            }}
          />
        </div>
        <p className="text-[9px] mt-1 font-mono" style={{ color: 'var(--color-text-ghost)' }}>
          {fmt.currency(stock.close)}
        </p>
      </div>

      {/* Change % — dominant */}
      <div
        className="shrink-0 font-mono font-black text-[14px] tabular-nums"
        style={{ color }}
      >
        {fmt.pct(stock.change_percent)}
      </div>
    </Link>
  );
}

// ---- Whale Card ----
function WhaleCard({ stock, rank }: { stock: any; rank: number }) {
  const score = Math.min(stock.conviction_score || 0, 100);
  const aov = stock.aov_ratio?.toFixed(2) || '—';
  return (
    <Link href={`/emiten/${stock.stock_code}`} className="whale-card group">
      {/* Top accent bar */}
      <div className="h-px w-full mb-3" style={{ background: 'linear-gradient(90deg, var(--color-whale), transparent)' }} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono font-black text-[15px] leading-none" style={{ color: 'var(--color-whale)' }}>
            {stock.stock_code}
          </p>
          <p className="text-[9px] mt-0.5 uppercase tracking-widest" style={{ color: 'var(--color-text-ghost)' }}>
            {stock.sector || 'Uncategorized'}
          </p>
        </div>
        <span
          className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'var(--color-whale-dim)', color: 'var(--color-whale)', border: '1px solid rgba(0,196,255,0.15)' }}
        >
          #{rank}
        </span>
      </div>

      {/* AOV ratio — hero number */}
      <div className="flex items-end gap-2 mb-3">
        <span className="font-mono font-black leading-none" style={{ fontSize: '28px', color: 'var(--color-whale)', lineHeight: 1 }}>
          {aov}
        </span>
        <span className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--color-whale)', opacity: 0.6 }}>x AOV</span>
      </div>

      {/* Conviction bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-ghost)' }}>
            Conviction
          </span>
          <span className="font-mono font-bold text-[11px]" style={{ color: score > 70 ? 'var(--color-whale)' : 'var(--color-text-muted)' }}>
            {score.toFixed(0)}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              background: score > 70
                ? 'linear-gradient(90deg, var(--color-whale), rgba(0,210,160,0.7))'
                : 'rgba(0,196,255,0.35)',
            }}
          />
        </div>
      </div>

      {/* Net foreign if available */}
      {stock.net_foreign !== undefined && (
        <div
          className="mt-3 pt-2.5 flex justify-between items-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-ghost)' }}>Net Foreign</span>
          <span
            className="font-mono font-bold text-[11px]"
            style={{ color: stock.net_foreign >= 0 ? 'var(--color-bull)' : 'var(--color-bear)' }}
          >
            {fmt.volume(stock.net_foreign)}
          </span>
        </div>
      )}
    </Link>
  );
}

// ---- Stat Tile — large format ----
function StatTile({
  label,
  value,
  sub,
  color = 'default',
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'bull' | 'bear' | 'whale' | 'accent' | 'default';
  accent?: boolean;
}) {
  const colorMap = {
    bull:    { main: 'var(--color-bull)',    dim: 'var(--color-bull-dim)',    border: 'rgba(0,230,118,0.12)' },
    bear:    { main: 'var(--color-bear)',    dim: 'var(--color-bear-dim)',    border: 'rgba(255,79,106,0.12)' },
    whale:   { main: 'var(--color-whale)',   dim: 'var(--color-whale-dim)',   border: 'rgba(0,196,255,0.12)' },
    accent:  { main: 'var(--color-accent)',  dim: 'var(--color-accent-dim)',  border: 'var(--color-border-accent)' },
    default: { main: 'var(--color-text-primary)', dim: 'transparent', border: 'var(--color-border)' },
  };
  const c = colorMap[color];
  return (
    <div
      className="stat-tile relative overflow-hidden"
      style={{ borderColor: c.border }}
    >
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: c.main, opacity: 0.6 }} />
      )}
      <p className="stat-label mb-2">{label}</p>
      <p className="font-mono font-black leading-none tabular-nums" style={{ fontSize: '22px', color: c.main }}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--color-text-ghost)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ---- Quick Nav Card ----
function QuickNavCard({
  href,
  label,
  sub,
  color,
  icon,
}: {
  href: string;
  label: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="quick-nav-card group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <p className="text-[13px] font-bold leading-none mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </p>
      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
      <div
        className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors group-hover:opacity-100 opacity-0"
        style={{ color }}
      >
        Buka <IconChevronRight size={9} />
      </div>
    </Link>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function DashboardClient({
  stocks, stats, sectors, latestDate, totalCount, gainers, losers, topGainers, topLosers, topWhales,
}: any) {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const unchanged = Math.max(0, totalCount - gainers - losers);
  const sentimentPct = totalCount > 0 ? Math.round((gainers / totalCount) * 100) : 50;
  const netForeign = stats?.total_net_foreign || 0;
  const isBullMarket = sentimentPct > 52;
  const isBearMarket = sentimentPct < 48;

  const sectorList = sectors
    ? Object.entries(sectors as Record<string, number>)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 7)
    : [];

  const breadthLabel = isBullMarket
    ? 'BULLISH'
    : isBearMarket
    ? 'BEARISH'
    : 'SIDEWAYS';
  const breadthColor = isBullMarket
    ? 'var(--color-bull)'
    : isBearMarket
    ? 'var(--color-bear)'
    : 'var(--color-neutral)';

  const activeList = activeTab === 'gainers' ? topGainers : topLosers;

  return (
    <div
      className={`min-h-screen p-4 md:p-5 lg:p-6 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* ═══════════════════════════════════════════════════════
            HEADER: Title + Date + Search
        ═══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1 h-5 rounded-full" style={{ background: 'var(--color-accent)' }} />
              <h1 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Intelligence Terminal
              </h1>
              <span
                className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)', border: '1px solid var(--color-border-accent)' }}
              >
                LIVE
              </span>
            </div>
            <p className="text-[11px] pl-3" style={{ color: 'var(--color-text-muted)' }}>
              {latestDate ? fmt.date(latestDate) : '—'}
              <span className="mx-2" style={{ color: 'var(--color-text-ghost)' }}>·</span>
              <span className="font-mono">{totalCount}</span> emiten terpantau
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickSearch.trim()) router.push(`/emiten/${quickSearch.toUpperCase().trim()}`);
            }}
            className="relative w-full sm:w-64"
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Cari kode... BBCA, GOTO"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value.toUpperCase())}
              className="input-terminal w-full pl-9 pr-10 py-2 text-[13px] font-mono"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono font-bold px-1 py-0.5 rounded"
              style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-ghost)', border: '1px solid var(--color-border)' }}
            >
              ↵
            </span>
          </form>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ROW 1: STAT TILES (5 columns)
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatTile
            label="Emiten Aktif"
            value={totalCount}
            sub="terpantau hari ini"
            accent
          />
          <StatTile
            label="Advance"
            value={gainers}
            sub={`${sentimentPct}% dari total`}
            color="bull"
            accent
          />
          <StatTile
            label="Decline"
            value={losers}
            sub={`${100 - sentimentPct}% dari total`}
            color="bear"
            accent
          />
          <StatTile
            label="Whale Signal"
            value={stats?.whale_count || 0}
            sub="big player terdeteksi"
            color="whale"
            accent
          />
          <StatTile
            label="Net Foreign"
            value={fmt.volume(netForeign)}
            sub={netForeign >= 0 ? 'net beli asing' : 'net jual asing'}
            color={netForeign >= 0 ? 'bull' : 'bear'}
            accent
          />
        </div>

        {/* ═══════════════════════════════════════════════════════
            ROW 2: MAIN CONTENT GRID
            [Gainers/Losers 1col] [Whale 1col] [Breadth+Sector 1col]
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── COL 1: Gainers / Losers ── */}
          <div className="panel-card overflow-hidden flex flex-col">
            {/* Tab header */}
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {(['gainers', 'losers'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const tabColor = tab === 'gainers' ? 'var(--color-bull)' : 'var(--color-bear)';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold uppercase tracking-wider transition-all relative"
                    style={{
                      color: isActive ? tabColor : 'var(--color-text-ghost)',
                      background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: tabColor }}
                      />
                    )}
                    {tab === 'gainers' ? <IconArrowUp size={9} /> : <IconArrowDown size={9} />}
                    {tab === 'gainers' ? 'Top Gainers' : 'Top Losers'}
                  </button>
                );
              })}
            </div>

            {/* Column header */}
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-text-ghost)', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="w-5">#</span>
              <span className="w-14">Code</span>
              <span className="flex-1">Momentum</span>
              <span className="w-12 text-right">Change</span>
            </div>

            {/* Rows */}
            <div className="flex-1 divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {(activeList || []).map((s: any, i: number) => (
                <StockRow
                  key={s.stock_code}
                  rank={i + 1}
                  stock={s}
                  type={activeTab === 'gainers' ? 'gainer' : 'loser'}
                />
              ))}
            </div>

            {/* Footer link */}
            <Link
              href="/screener"
              className="screener-footer-link flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider"
            >
              Lihat semua di Screener <IconExternalLink size={9} />
            </Link>
          </div>

          {/* ── COL 2: Whale Signals ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--color-whale)' }}><IconFish /></span>
                <p className="section-heading" style={{ color: 'var(--color-whale)', opacity: 0.7 }}>Whale Signals</p>
              </div>
              <Link
                href="/whale-tracker"
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-whale)' }}
              >
                All <IconChevronRight size={9} />
              </Link>
            </div>

            {(topWhales || []).length > 0 ? (
              <div className="space-y-3">
                {topWhales.map((s: any, i: number) => (
                  <WhaleCard key={s.stock_code} stock={s} rank={i + 1} />
                ))}
              </div>
            ) : (
              <div className="panel-card p-8 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--color-text-ghost)' }}>
                <IconFish />
                <p className="text-[12px] text-center">Tidak ada whale signal terdeteksi hari ini</p>
              </div>
            )}
          </div>

          {/* ── COL 3: Breadth + Sector ── */}
          <div className="flex flex-col gap-4">

            {/* Market Breadth Panel */}
            <div className="panel-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--color-text-muted)' }}><IconActivity /></span>
                  <p className="section-heading">Market Breadth</p>
                </div>
                <span
                  className="text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: `${breadthColor}18`, color: breadthColor, border: `1px solid ${breadthColor}30` }}
                >
                  {breadthLabel}
                </span>
              </div>

              {/* Gauge + stats row */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <BreadthGauge pct={sentimentPct} />
                </div>
                <div className="flex flex-col gap-2 text-right pb-1">
                  <div>
                    <p className="font-mono font-black text-[18px] leading-none" style={{ color: 'var(--color-bull)' }}>{gainers}</p>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-ghost)' }}>Advance</p>
                  </div>
                  <div>
                    <p className="font-mono font-black text-[18px] leading-none" style={{ color: 'var(--color-bear)' }}>{losers}</p>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-ghost)' }}>Decline</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[13px] leading-none" style={{ color: 'var(--color-text-ghost)' }}>{unchanged}</p>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-ghost)' }}>Unchanged</p>
                  </div>
                </div>
              </div>

              {/* Multi-segment progress bar */}
              <div className="mt-3 h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${(gainers / Math.max(totalCount, 1)) * 100}%`, background: 'var(--color-bull)', opacity: 0.85 }}
                />
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${(unchanged / Math.max(totalCount, 1)) * 100}%`, background: 'rgba(255,255,255,0.08)' }}
                />
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${(losers / Math.max(totalCount, 1)) * 100}%`, background: 'var(--color-bear)', opacity: 0.85 }}
                />
              </div>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--color-text-ghost)' }}>
                {sentimentPct}% saham menguat &nbsp;·&nbsp; {100 - sentimentPct}% melemah
              </p>
            </div>

            {/* Sector Breakdown Panel */}
            <div className="panel-card p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--color-text-muted)' }}><IconGrid /></span>
                  <p className="section-heading">Sector Breadth</p>
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-ghost)' }}>
                  {sectorList.length} sektor
                </span>
              </div>

              <div className="space-y-2.5">
                {sectorList.map(([name, count], i) => (
                  <SectorRow
                    key={name}
                    name={name as string}
                    count={count as number}
                    total={totalCount}
                    rank={i + 1}
                  />
                ))}
              </div>

              {/* Footer stats */}
              <div
                className="mt-4 pt-3 grid grid-cols-2 gap-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div>
                  <p className="stat-label">Avg Volume</p>
                  <p className="font-mono font-bold text-[12px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {fmt.volume(stats?.avg_volume || 0)}
                  </p>
                </div>
                <div>
                  <p className="stat-label">Total Nilai</p>
                  <p className="font-mono font-bold text-[12px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {fmt.volume(stats?.total_value || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ROW 3: QUICK ACCESS NAV
        ═══════════════════════════════════════════════════════ */}
        <div>
          <p className="section-heading mb-3 px-0.5">Quick Access</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickNavCard
              href="/screener"
              label="Screener"
              sub="Filter & temukan saham dengan kriteria kustom"
              color="var(--color-accent)"
              icon={<IconSearch />}
            />
            <QuickNavCard
              href="/heatmap"
              label="Heatmap"
              sub="Visualisasi pergerakan seluruh pasar sekaligus"
              color="var(--color-whale)"
              icon={<IconGrid />}
            />
            <QuickNavCard
              href="/whale-tracker"
              label="Whale Tracker"
              sub="Lacak aksi big player & institusi"
              color="var(--color-neutral)"
              icon={<IconFish />}
            />
            <QuickNavCard
              href="/compare"
              label="Compare"
              sub="Bandingkan performa antar emiten"
              color="var(--color-bull)"
              icon={<IconActivity />}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p
          className="text-[10px] text-center pb-2 leading-relaxed"
          style={{ color: 'var(--color-text-ghost)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}
        >
          Data disajikan untuk tujuan informatif. Bukan merupakan rekomendasi investasi.
          Keputusan investasi sepenuhnya merupakan tanggung jawab investor.
        </p>
      </div>
    </div>
  );
}
