'use client'

import { BEST_POSTING_TIMES, BRAYDEN_STATS } from '@/lib/constants'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Heat map: 0-4 scale (0=none, 4=best)
const HEATMAP: number[][] = [
  // 12a 1  2  3  4  5  6  7  8  9  10 11 12p 1  2  3  4  5  6  7  8  9  10 11
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 2, 3, 4, 4, 3, 2, 1], // Sun
  [0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 3, 4, 4, 3, 2, 1, 0], // Mon
  [0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 3, 4, 4, 3, 2, 1, 0], // Tue
  [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 1, 2, 3, 4, 3, 3, 2, 0], // Wed
  [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 4, 3, 2, 1], // Thu
  [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 3, 3, 4, 4, 3, 3, 2], // Fri
  [0, 0, 0, 0, 0, 0, 1, 1, 2, 4, 4, 3, 3, 2, 2, 2, 2, 3, 3, 4, 4, 3, 2, 1], // Sat
]

const HEAT_COLORS = [
  'bg-surface',
  'bg-accent/10',
  'bg-accent/25',
  'bg-accent/50',
  'bg-accent',
]

const HOURS = ['12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '', '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', '']

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Followers" value={BRAYDEN_STATS.followers} trend="+12%" />
        <StatCard icon="❤️" label="Total Likes" value={BRAYDEN_STATS.likes} trend="+8%" />
        <StatCard icon="📅" label="Best Day" value="Sunday" sub="9–11 AM" />
        <StatCard icon="🎯" label="Optimal Caption" value="150–220" sub="characters" />
      </div>

      {/* Posting time heatmap */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Best Posting Times — Archery Content
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Hour labels */}
            <div className="flex gap-1 ml-10 mb-1">
              {HOURS.map((h, i) => (
                <div key={i} className="w-4 text-center text-[9px] text-text-muted flex-shrink-0">{h}</div>
              ))}
            </div>
            {/* Grid */}
            {HEATMAP.map((row, di) => (
              <div key={di} className="flex items-center gap-1 mb-1">
                <span className="text-xs text-text-muted w-9 flex-shrink-0">{DAYS[di]}</span>
                {row.map((val, hi) => (
                  <div
                    key={hi}
                    className={`w-4 h-4 rounded-sm flex-shrink-0 ${HEAT_COLORS[val]} border border-border/20 cursor-default`}
                    title={`${DAYS[di]} ${hi}:00 — ${['No data', 'Low', 'Medium', 'Good', 'Best'][val]}`}
                  />
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-2 mt-2 ml-10">
              <span className="text-[10px] text-text-muted">Less</span>
              {HEAT_COLORS.map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${c} border border-border/20`} />
              ))}
              <span className="text-[10px] text-text-muted">Best</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-day breakdown */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Weekly Posting Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BEST_POSTING_TIMES.map(d => (
            <div key={d.day} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border">
              <div>
                <span className="font-medium text-text-primary text-sm">{d.day}</span>
                <p className="text-xs text-text-muted">{d.note}</p>
              </div>
              <div className="text-right">
                {d.times.map(t => (
                  <span key={t} className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent ml-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caption optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Caption Length Guide</h3>
          <div className="space-y-3">
            <LengthBar label="50–100 chars" pct={70} note="Short & punchy — high shares" color="bg-gold" />
            <LengthBar label="100–150 chars" pct={90} note="Sweet spot for engagement" color="bg-accent" />
            <LengthBar label="150–220 chars" pct={100} note="Optimal — story + hook" color="bg-accent" best />
            <LengthBar label="220–300 chars" pct={75} note="Good — detailed storytelling" color="bg-accent/60" />
            <LengthBar label="300+ chars" pct={45} note="Lower reach — too long" color="bg-danger/60" />
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Hook Strategies</h3>
          <div className="space-y-2">
            {[
              { type: 'Question', example: '"Could YOU make this shot? 🎯"', score: '⭐⭐⭐⭐⭐' },
              { type: 'Statement Reveal', example: '"I just broke the STATE RECORD 🏆"', score: '⭐⭐⭐⭐⭐' },
              { type: 'Watch Till End', example: '"Watch till the end 👀"', score: '⭐⭐⭐⭐' },
              { type: 'Number/Score', example: '"294/300 at [Tournament] 📊"', score: '⭐⭐⭐⭐' },
              { type: 'POV Format', example: '"Competition day POV 🏹"', score: '⭐⭐⭐' },
              { type: 'Relatable Pain', example: '"When you wake up at 5am for..."', score: '⭐⭐⭐' },
            ].map(h => (
              <div key={h.type} className="flex items-center justify-between p-2 rounded-lg bg-surface/50 border border-border">
                <div>
                  <span className="text-xs font-medium text-text-primary">{h.type}</span>
                  <p className="text-[11px] text-text-muted">{h.example}</p>
                </div>
                <span className="text-xs">{h.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content strategy */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Content Mix Strategy</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { type: 'Tournament Recaps', pct: 30, note: 'Core audience driver', color: '#22c55e' },
            { type: 'Practice/Training', pct: 25, note: 'Builds aspiration & relatability', color: '#3b82f6' },
            { type: 'Score Reveals', pct: 20, note: 'High share/save rate', color: '#f59e0b' },
            { type: 'Gear/Setup', pct: 10, note: 'Reaches gear community', color: '#8b5cf6' },
            { type: 'Trick Shots', pct: 10, note: 'Viral potential', color: '#ec4899' },
            { type: 'Day in the Life', pct: 5, note: 'Humanizes the athlete', color: '#06b6d4' },
          ].map(c => (
            <div key={c.type} className="p-3 rounded-lg bg-surface/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-xs font-medium text-text-primary">{c.type}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: c.color }}>{c.pct}%</div>
              <p className="text-[11px] text-text-muted mt-0.5">{c.note}</p>
              {/* Bar */}
              <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct * 3.3}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, sub }: { icon: string; label: string; value: string; trend?: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-text-primary">{value}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
      {trend && <div className="text-xs text-accent font-medium mt-1">{trend}</div>}
    </div>
  )
}

function LengthBar({ label, pct, note, color, best }: { label: string; pct: number; note: string; color: string; best?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${best ? 'text-accent' : 'text-text-secondary'}`}>
          {label} {best && '← OPTIMAL'}
        </span>
        <span className="text-xs text-text-muted">{pct}% reach</span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-text-muted mt-0.5">{note}</p>
    </div>
  )
}
