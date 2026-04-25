'use client';

import { useState } from 'react';
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
    new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
};

// ---- Icon components ----
function ArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M2 5L5 2L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2V8M2 5L5 8L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 10V6M4.5 10V4M8 10V2M11.5 10V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ---- Sub-components ----

function StatCard({
  label,
  value,
  sub,
  color = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'bull' | 'bear' | 'whale' | 'accent' | 'default';
}) {
  const colorMap = {
    bull:    { text: 'var(--color-bull)',    dim: 'var(--color-bull-dim)',    border: 'rgba(0,230,118,0.15)' },
    bear:    { text: 'var(--color-bear)',    dim: 'var(--color-bear-dim)',    border: 'rgba(255,79,106,0.15)' },
    whale:   { text: 'var(--color-whale)',   dim: 'var(--color-whale-dim)',   border: 'rgba(0,196,255,0.15)' },
    accent:  { text: 'var(--color-accent)',  dim: 'var(--color-accent-dim)',  border: 'var(--color-border-accent)' },
    default: { text: 'var(--color-text-primary)', dim: 'transparent', border: 'var(--color-border)' },
  };
  const c = colorMap[color];
  return (
    <div
      className="card p-4 flex flex-col gap-1.5 group cursor-default"
      style={{ borderColor: c.border, background: 'var(--color-bg-surface)' }}
    >
      <p className="stat-label">{label}</p>
      <p
        className="stat-value text-xl leading-none"
        style={{ color: c.text }}
      >
        {value}
      </p>
      {sub && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ pct }: { pct: number }) {
  const abs = Math.abs(pct);
  const capped = Math.min(abs, 100);
  const isBull = pct >= 0;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="h-1 rounded-full"
        style={{
          width: `${Math.max(capped * 0.6, 4)}px`,
          background: isBull ? 'var(--color-bull)' : 'var(--color-bear)',
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function StockRow({
  rank,
  stock,
  type,
}: {
  rank: number;
  stock: any;
  type: 'gainer' | 'loser';
}) {
  const isBull = type === 'gainer';
  return (
    <Link
      href={`/emiten/${stock.stock_code}`}
      className="flex items-center gap-3 px-4 py-2.5 transition-all group hover:bg-elevated"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Rank */}
      <span
        className="w-5 text-center text-[10px] font-mono font-bold"
        style={{ color: 'var(--color-text-ghost)' }}
      >
        {rank}
      </span>

      {/* Code + sector */}
      <div className="flex-1 min-w-0">
        <p
          className="font-mono font-bold text-[13px] leading-none"
          style={{ color: isBull ? 'var(--color-bull)' : 'var(--color-bear)' }}
        >
          {stock.stock_code}
        </p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {stock.sector || '—'}
        </p>
      </div>

      {/* Mini bar */}
      <MiniBar pct={stock.change_percent} />

      {/* Change */}
      <div className="text-right">
        <p
          className="font-mono font-bold text-[12px]"
          style={{ color: isBull ? 'var(--color-bull)' : 'var(--color-bear)' }}
        >
          {fmt.pct(stock.change_percent)}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          {fmt.currency(stock.close)}
        </p>
      </div>
    </Link>
  );
}

function WhaleCard({ stock, rank }: { stock: any; rank: number }) {
  return (
    <Link
      href={`/emiten/${stock.stock_code}`}
      className="card whale-card p-3.5 flex flex-col gap-2 group transition-all hover:bg-elevated"
      style={{ borderColor: 'rgba(0,196,255,0.15)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono font-bold text-[13px]"
          style={{ color: 'var(--color-whale)' }}
        >
          {stock.stock_code}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
          style={{ background: 'var(--color-whale-dim)', color: 'var(--color-whale)', border: '1px solid rgba(0,196,255,0.2)' }}
        >
          #{rank}
        </span>
      </div>

      {/* AOV ratio — big number */}
      <div>
        <p
          className="font-mono font-black text-2xl leading-none"
          style={{ color: 'var(--color-whale)' }}
        >
          {stock.aov_ratio?.toFixed(2)}<span className="text-sm font-semibold ml-0.5">x</span>
        </p>
        <p className="text-[9px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          AOV Ratio
        </p>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Conviction
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            {stock.conviction_score?.toFixed(0)}%
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-overlay)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(stock.conviction_score || 0, 100)}%`,
              background: 'linear-gradient(90deg, var(--color-whale), var(--color-accent))',
            }}
          />
        </div>
      </div>
    </Link>
  );
}

function SectorBar({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="w-20 text-[11px] font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {name}
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-overlay)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'var(--color-accent)', opacity: 0.7 }}
        />
      </div>
      <span className="w-6 text-right font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {count}
      </span>
    </div>
  );
}

// ---- Main Dashboard ----
export default function DashboardClient({
  stocks, stats, sectors, latestDate, totalCount, gainers, losers, topGainers, topLosers, topWhales,
}: any) {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  const unchanged = totalCount - gainers - losers;
  const sentimentPct = totalCount > 0 ? Math.round((gainers / totalCount) * 100) : 50;

  const sectorList = sectors
    ? Object.entries(sectors as Record<string, number>)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 8)
    : [];

  const netForeign = stats.total_net_foreign || 0;

  return (
    <div
      className="min-h-screen p-4 md:p-6 animate-fade-in"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ═══════════════════════════════════════
            HEADER ROW: Date + Search
        ═══════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <h1
              className="text-xl font-bold leading-tight text-gradient-accent"
            >
              Intelligence Terminal
            </h1>
            <p className="text-[11px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {latestDate ? fmt.date(latestDate) : '—'} &nbsp;·&nbsp; {totalCount} emiten aktif
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickSearch.trim()) router.push(`/emiten/${quickSearch.toUpperCase().trim()}`);
            }}
            className="relative w-full md:w-72"
          >
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Cari kode saham... BBCA"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value.toUpperCase())}
              className="input-terminal w-full pl-9 pr-4 py-2.5 text-sm font-mono"
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold px-1 py-0.5 rounded"
              style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              ↵
            </div>
          </form>
        </div>

        {/* ═══════════════════════════════════════
            STAT STRIP
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Emiten" value={totalCount} sub="terpantau hari ini" />
          <StatCard label="Whale Signal" value={stats.whale_count || 0} sub="big player detected" color="whale" />
          <StatCard label="Advance" value={gainers} sub={`${sentimentPct}% dari total`} color="bull" />
          <StatCard label="Decline" value={losers} sub={`${100 - sentimentPct}% dari total`} color="bear" />
          <StatCard
            label="Net Foreign"
            value={fmt.volume(netForeign)}
            sub={netForeign >= 0 ? 'net beli asing' : 'net jual asing'}
            color={netForeign >= 0 ? 'bull' : 'bear'}
          />
        </div>

        {/* ═══════════════════════════════════════
            MARKET SENTIMENT GAUGE
        ═══════════════════════════════════════ */}
        <div
          className="card px-4 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="section-heading">Market Breadth</p>
            <div className="flex items-center gap-3 text-[11px]">
              <span style={{ color: 'var(--color-bull)' }}>{gainers} Adv</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{unchanged} Unc</span>
              <span style={{ color: 'var(--color-bear)' }}>{losers} Dec</span>
            </div>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden flex gap-px"
            style={{ background: 'var(--color-bg-overlay)' }}
          >
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${(gainers / totalCount) * 100}%`, background: 'var(--color-bull)', opacity: 0.85 }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${(unchanged / totalCount) * 100}%`, background: 'var(--color-text-ghost)' }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${(losers / totalCount) * 100}%`, background: 'var(--color-bear)', opacity: 0.85 }}
            />
          </div>
          <p
            className="text-[10px] mt-2"
            style={{ color: sentimentPct > 50 ? 'var(--color-bull)' : sentimentPct < 50 ? 'var(--color-bear)' : 'var(--color-text-muted)' }}
          >
            {sentimentPct > 55 ? 'Market cenderung BULLISH' : sentimentPct < 45 ? 'Market cenderung BEARISH' : 'Market SIDEWAYS — tunggu konfirmasi'}
          </p>
        </div>

        {/* ═══════════════════════════════════════
            MAIN GRID: Movers + Sector + Whale
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* --- Gainers / Losers panel --- */}
          <div className="lg:col-span-1 card overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {/* Tabs */}
            <div
              className="flex border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {(['gainers', 'losers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    color: activeTab === tab
                      ? (tab === 'gainers' ? 'var(--color-bull)' : 'var(--color-bear)')
                      : 'var(--color-text-muted)',
                    background: activeTab === tab ? 'var(--color-bg-elevated)' : 'transparent',
                    borderBottom: activeTab === tab
                      ? `2px solid ${tab === 'gainers' ? 'var(--color-bull)' : 'var(--color-bear)'}`
                      : '2px solid transparent',
                  }}
                >
                  {tab === 'gainers' ? (
                    <span className="flex items-center justify-center gap-1.5"><ArrowUp /> Top Gainers</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5"><ArrowDown /> Top Losers</span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div>
              {(activeTab === 'gainers' ? topGainers : topLosers).map((s: any, i: number) => (
                <StockRow key={s.stock_code} rank={i + 1} stock={s} type={activeTab === 'gainers' ? 'gainer' : 'loser'} />
              ))}
            </div>

            <Link
              href="/screener"
              className="flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all hover:text-accent"
              style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)', borderTop: '1px solid var(--color-border)' }}
            >
              Lihat semua di Screener <IconChevronRight />
            </Link>
          </div>

          {/* --- Whale Signals --- */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="section-heading">Whale Signals</p>
              <Link
                href="/whale-tracker"
                className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-all hover:opacity-70"
                style={{ color: 'var(--color-whale)' }}
              >
                All Signals <IconChevronRight />
              </Link>
            </div>

            {topWhales.length > 0 ? (
              topWhales.map((s: any, i: number) => (
                <WhaleCard key={s.stock_code} stock={s} rank={i + 1} />
              ))
            ) : (
              <div
                className="card p-6 text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <p className="text-[13px]">Tidak ada whale signal hari ini</p>
              </div>
            )}
          </div>

          {/* --- Sector Breakdown --- */}
          <div className="lg:col-span-1 card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="section-heading">Sector Breadth</p>
              <IconBarChart />
            </div>

            {sectorList.length > 0 ? (
              <div>
                {sectorList.map(([name, count]) => (
                  <SectorBar key={name} name={name as string} count={count as number} total={totalCount} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                <p className="text-[12px]">Data sektor tidak tersedia</p>
              </div>
            )}

            <div
              className="mt-4 pt-3 grid grid-cols-2 gap-2 text-[11px]"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="stat-label">Avg Volume</p>
                <p className="font-mono font-bold mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {fmt.volume(stats.avg_volume || 0)}
                </p>
              </div>
              <div>
                <p className="stat-label">Total Nilai</p>
                <p className="font-mono font-bold mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {fmt.volume(stats.total_value || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            QUICK ACCESS ROW
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/screener', label: 'Screener', sub: 'Filter & cari saham', color: 'var(--color-accent)' },
            { href: '/heatmap', label: 'Heatmap', sub: 'Visualisasi pasar', color: 'var(--color-whale)' },
            { href: '/whale-tracker', label: 'Whale Tracker', sub: 'Lacak big player', color: 'var(--color-neutral)' },
            { href: '/compare', label: 'Compare', sub: 'Bandingkan emiten', color: 'var(--color-bull)' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card px-4 py-3 flex items-center justify-between group transition-all hover:bg-elevated"
            >
              <div>
                <p className="text-[12px] font-bold" style={{ color: item.color }}>{item.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</p>
              </div>
              <span style={{ color: 'var(--color-text-ghost)' }}><IconChevronRight /></span>
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            DISCLAIMER
        ═══════════════════════════════════════ */}
        <p
          className="text-[10px] text-center pb-2 leading-relaxed"
          style={{ color: 'var(--color-text-ghost)' }}
        >
          Data disajikan untuk tujuan informatif. Bukan merupakan rekomendasi investasi.
          Keputusan investasi sepenuhnya merupakan tanggung jawab investor.
        </p>
      </div>
    </div>
  );
}
