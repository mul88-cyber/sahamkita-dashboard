'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/supabase';

// SVG icon components — clean, geometric, consistent 16px
function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function IconScreener() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 7H9M7 5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconInsight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
    </svg>
  );
}

function IconCompare() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L5 8L8 10L11 5L14 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 8L5 4L8 6L11 2L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.5 1.5"/>
    </svg>
  );
}

function IconWhale() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 10C1.5 10 3 6 6 6C9 6 8 9 11 9C13 9 14.5 7 14.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M14.5 7L13 10C13 10 11 12 8 11C5 10 3.5 12 2 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12.5" cy="6" r="0.8" fill="currentColor"/>
    </svg>
  );
}

function IconWatchlist() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L9.5 5.5H13.5L10.5 7.5L11.5 11L8 9L4.5 11L5.5 7.5L2.5 5.5H6.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 14C2 11.2 4.7 9 8 9C11.3 9 14 11.2 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconPricing() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 5.5L15 6.2L11.5 9.5L12.3 14.5L8 12.2L3.7 14.5L4.5 9.5L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconHeatmap() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="6" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="6" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="6" y="6" width="4" height="4" rx="0.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11" y="6" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="11" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="6" y="11" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11" y="11" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
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

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 12H2.5C2 12 1.5 11.5 1.5 11V3C1.5 2.5 2 2 2.5 2H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9 10L12.5 7L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: 'Market',
      items: [
        { href: '/', label: 'Dashboard', icon: <IconDashboard /> },
        { href: '/screener', label: 'Screener', icon: <IconScreener /> },
        { href: '/heatmap', label: 'Heatmap', icon: <IconHeatmap /> },
        { href: '/insight', label: 'Insight', icon: <IconInsight /> },
        { href: '/compare', label: 'Compare', icon: <IconCompare /> },
        { href: '/whale-tracker', label: 'Whale Tracker', icon: <IconWhale /> },
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '/watchlist', label: 'Watchlist', icon: <IconWatchlist />, requiresAuth: true },
        { href: '/profile', label: 'Profile', icon: <IconProfile />, requiresAuth: true },
        { href: '/pricing', label: 'Pricing', icon: <IconPricing />, badge: 'PRO' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full flex flex-col
          transition-all duration-200 ease-in-out
          border-r
          ${expanded ? 'w-52' : 'w-[56px] -translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div
          className="flex items-center h-[52px] px-3.5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Icon mark */}
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-xs"
            style={{
              background: 'linear-gradient(135deg, #00d2a0, #00c4ff)',
              color: '#080d14',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '-0.5px',
            }}
          >
            SK
          </div>
          {expanded && (
            <div className="ml-2.5 overflow-hidden animate-slide-in whitespace-nowrap">
              <p className="text-sm font-bold text-gradient-accent leading-none">SahamKita</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Intelligence</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 overflow-x-hidden">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-1">
              {expanded && (
                <p
                  className="px-3.5 py-1.5 section-heading animate-fade-in whitespace-nowrap"
                >
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                if (item.requiresAuth && !user) return null;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item mx-1.5 my-0.5 ${active ? 'active' : ''}`}
                    title={!expanded ? item.label : undefined}
                    style={{ padding: expanded ? '7px 10px' : '8px 10px' }}
                  >
                    <span className="flex-shrink-0" style={{ opacity: active ? 1 : 0.7 }}>
                      {item.icon}
                    </span>
                    {expanded && (
                      <span className="animate-slide-in flex-1 whitespace-nowrap text-[13px]">
                        {item.label}
                      </span>
                    )}
                    {expanded && item.badge && (
                      <span
                        className="text-[9px] font-bold px-1 py-0.5 rounded"
                        style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)', letterSpacing: '0.05em' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!expanded && active && (
                      <span
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-l"
                        style={{ background: 'var(--color-accent)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div
          className="border-t flex-shrink-0 p-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {user ? (
            expanded ? (
              <div
                className="rounded-md p-2.5"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #00d2a0, #00c4ff)',
                      color: '#080d14',
                    }}
                  >
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <p
                    className="text-xs truncate flex-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                  className="flex items-center gap-1.5 mt-2 text-[11px] w-full px-1 py-1 rounded transition-colors hover:bg-white/5"
                  style={{ color: 'var(--color-bear)' }}
                >
                  <IconLogout />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                className="w-full flex justify-center py-2"
                title="Logout"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #00d2a0, #00c4ff)', color: '#080d14' }}
                >
                  {user.email?.[0]?.toUpperCase()}
                </div>
              </button>
            )
          ) : (
            expanded ? (
              <div className="space-y-1.5 p-1">
                <Link
                  href="/login"
                  className="block w-full text-center py-2 text-[12px] font-semibold rounded-md transition-all"
                  style={{ background: 'var(--color-accent)', color: '#080d14' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center py-2 text-[12px] font-medium rounded-md transition-all"
                  style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                >
                  Daftar
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex justify-center py-2"
                title="Login"
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
                >
                  <IconChevronRight />
                </div>
              </Link>
            )
          )}
        </div>
      </aside>
    </>
  );
}
