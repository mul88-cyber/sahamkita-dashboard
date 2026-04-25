'use client';

import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 1V2.5M7 11.5V13M1 7H2.5M11.5 7H13M2.9 2.9L3.9 3.9M10.1 10.1L11.1 11.1M11.1 2.9L10.1 3.9M3.9 10.1L2.9 11.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 8.5C10.7 9 9.7 9.5 8.5 9.5C5.7 9.5 3.5 7.3 3.5 4.5C3.5 3.3 3.9 2.2 4.6 1.4C2.3 2 0.5 4.1 0.5 6.5C0.5 9.8 3.2 12.5 6.5 12.5C9 12.5 11.1 10.9 11.5 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconScreener() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconWhale() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 8C1 8 2.5 5 5 5C7.5 5 6.5 8 9 8C10.5 8 12 6.5 12 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M12 6.5L10.5 9C10.5 9 9 10.5 7 10C5 9.5 3.5 10.5 2 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1L8 4.5H12L9 6.5L10 10L6.5 8L3 10L4 6.5L1 4.5H5L6.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/screener': 'Screener',
  '/insight': 'Insight',
  '/compare': 'Compare',
  '/watchlist': 'Watchlist',
  '/whale-tracker': 'Whale Tracker',
  '/heatmap': 'Heatmap',
  '/market-breadth': 'Market Breadth',
  '/profile': 'Profile',
  '/pricing': 'Pricing',
  '/quant': 'Quant',
};

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentLabel = routeLabels[pathname] || (segments.length > 0 ? segments[segments.length - 1].toUpperCase() : 'Dashboard');

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between h-[52px] px-4"
      style={{
        background: 'rgba(8, 13, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: breadcrumb path */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        <Link
          href="/"
          className="uppercase tracking-wider font-medium transition-colors hover:text-accent"
          style={{ color: 'var(--color-text-muted)' }}
        >
          SK
        </Link>
        {segments.length > 0 && (
          <>
            <span style={{ color: 'var(--color-text-ghost)' }}>/</span>
            <span className="uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {currentLabel}
            </span>
          </>
        )}

        {/* Live indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.12)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
            style={{ background: 'var(--color-bull)' }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-bull)' }}>
            Live
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/screener"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all topbar-nav-link"
        >
          <IconScreener />
          <span className="uppercase tracking-wider">Screener</span>
        </Link>

        <Link
          href="/whale-tracker"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all topbar-whale-link"
          style={{ color: 'var(--color-whale)' }}
        >
          <IconWhale />
          <span className="uppercase tracking-wider">Whale</span>
        </Link>

        <Link
          href="/watchlist"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all topbar-neutral-link"
          style={{ color: 'var(--color-neutral)' }}
        >
          <IconStar />
          <span className="uppercase tracking-wider">Watchlist</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md transition-all topbar-icon-btn"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  );
}
