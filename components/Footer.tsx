import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center font-mono"
              style={{ background: 'linear-gradient(135deg, #00d2a0, #00c4ff)', color: '#080d14' }}
            >
              SK
            </div>
            <div>
              <p className="text-[12px] font-bold text-gradient-accent">SahamKita</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-text-ghost)' }}>
                Bandarmologi Intelligence
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {[
              { href: '/', label: 'Dashboard' },
              { href: '/screener', label: 'Screener' },
              { href: '/heatmap', label: 'Heatmap' },
              { href: '/pricing', label: 'Pricing' },
              { href: 'mailto:admin@sahamkita.com', label: 'Kontak' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="uppercase tracking-wider font-medium transition-colors hover:text-accent"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Copyright + disclaimer */}
          <p
            className="text-[10px] text-center md:text-right leading-relaxed"
            style={{ color: 'var(--color-text-ghost)' }}
          >
            &copy; 2026 SahamKita. Bukan rekomendasi investasi.
          </p>
        </div>
      </div>
    </footer>
  );
}
