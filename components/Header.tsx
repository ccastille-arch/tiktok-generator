'use client'

import { BRAYDEN_STATS } from '@/lib/constants'

export default function Header() {
  return (
    <header className="border-b border-border/50 mb-2">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center text-xl shadow-lg glow-green">
            🏹
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">
              TikTok Generator
            </h1>
            <p className="text-xs text-text-secondary">{BRAYDEN_STATS.handle}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6">
          <StatBadge label="Followers" value={BRAYDEN_STATS.followers} />
          <StatBadge label="Likes" value={BRAYDEN_STATS.likes} />
          <div className="flex gap-1 flex-wrap justify-end max-w-xs">
            {BRAYDEN_STATS.titles.map(t => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* TikTok link */}
        <a
          href="https://www.tiktok.com/@braydens.archery"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.12 8.12 0 0 0 4.74 1.5V6.72a4.85 4.85 0 0 1-.97-.03z"/>
          </svg>
          View Profile
        </a>
      </div>
    </header>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-accent leading-tight">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}
