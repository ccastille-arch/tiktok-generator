'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { MediaFile, GeneratedPost } from '@/app/page'

interface Props {
  files: MediaFile[]
  posts: GeneratedPost[]
  onReset: () => void
  onBack: () => void
}

const SCHEDULE_GAPS = [
  { label: '1 hr apart', hours: 1 },
  { label: '2 hrs apart', hours: 2 },
  { label: '4 hrs apart', hours: 4 },
  { label: '8 hrs apart', hours: 8 },
  { label: '1 day apart', hours: 24 },
  { label: '2 days apart', hours: 48 },
]

function addHours(date: Date, h: number) {
  return new Date(date.getTime() + h * 3_600_000)
}

function fmt(d: Date) {
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function Step3Results({ files, posts, onReset, onBack }: Props) {
  const [copied, setCopied] = useState<Record<number, boolean>>({})
  const [expanded, setExpanded] = useState<number>(0)
  const [gapHours, setGapHours] = useState(24)

  // Build schedule starting at next 7pm (or now+1hr if after 6pm)
  const buildSchedule = () => {
    const now = new Date()
    let start = new Date(now)
    start.setMinutes(0, 0, 0)
    if (start.getHours() >= 20) {
      // after 8pm — start tomorrow at 7pm
      start.setDate(start.getDate() + 1)
      start.setHours(19, 0, 0, 0)
    } else if (start.getHours() < 7) {
      start.setHours(7, 0, 0, 0)
    } else {
      start.setHours(start.getHours() + 1)
    }
    return posts.map((_, i) => addHours(start, i * gapHours))
  }

  const schedule = buildSchedule()

  const copyPost = (post: GeneratedPost, idx: number) => {
    const text = `${post.caption}\n\n${post.hashtags.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [idx]: true }))
    toast.success(`Post ${idx + 1} caption + hashtags copied!`)
    setTimeout(() => setCopied(prev => ({ ...prev, [idx]: false })), 3000)
  }

  const copyAllSchedule = () => {
    const lines = posts.map((p, i) =>
      `POST ${i + 1} — ${fmt(schedule[i])}\n` +
      `Media: ${p.mediaIndices.map(n => `File ${n + 1}`).join(', ')}\n` +
      `Sound: ${p.sound}\n\n` +
      `${p.caption}\n\n${p.hashtags.join(' ')}\n`
    ).join('\n───────────────\n\n')
    navigator.clipboard.writeText(lines)
    toast.success('Full schedule copied!')
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{posts.length} Posts Ready 🎬</h2>
          <p className="text-text-muted text-xs">Tap a post to expand · Copy caption &amp; hashtags · Upload files to TikTok</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="btn-secondary text-xs px-3 py-1.5">← Redo</button>
          <button onClick={onReset} className="btn-secondary text-xs px-3 py-1.5">New Batch</button>
        </div>
      </div>

      {/* Schedule gap picker */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-text-primary whitespace-nowrap">📅 Post spacing:</span>
          <div className="flex gap-1.5 flex-wrap">
            {SCHEDULE_GAPS.map(g => (
              <button
                key={g.hours}
                onClick={() => setGapHours(g.hours)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  gapHours === g.hours
                    ? 'bg-accent/20 border-accent/60 text-accent font-medium'
                    : 'bg-surface border-border text-text-secondary hover:border-border/80'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <button onClick={copyAllSchedule} className="btn-secondary text-xs px-3 py-1.5 ml-auto">
            📋 Copy All
          </button>
        </div>
      </div>

      {/* Post cards */}
      {posts.map((post, idx) => {
        const mediaFiles = post.mediaIndices.map(i => files[i]).filter(Boolean)
        const isOpen = expanded === idx

        return (
          <div
            key={idx}
            className={`glass-card overflow-hidden transition-all ${isOpen ? 'glow-green' : ''}`}
          >
            {/* Collapsed header */}
            <button
              className="w-full p-4 flex items-center gap-4 text-left"
              onClick={() => setExpanded(isOpen ? -1 : idx)}
            >
              {/* Post number */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0
                ${isOpen ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary'}
              `}>
                {idx + 1}
              </div>

              {/* Media thumbnails (collapsed preview) */}
              <div className="flex gap-1 flex-shrink-0">
                {mediaFiles.slice(0, 4).map((f, ti) => (
                  <div key={ti} className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                    {f.kind === 'image' ? (
                      <img src={f.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface/80 flex items-center justify-center text-[10px]">▶</div>
                    )}
                  </div>
                ))}
                {mediaFiles.length > 4 && (
                  <div className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] text-text-muted flex-shrink-0">
                    +{mediaFiles.length - 4}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-primary">{post.title}</span>
                  <span className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                    {mediaFiles.length} files
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">{post.caption}</p>
              </div>

              {/* Schedule time */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-gold font-medium">{fmt(schedule[idx])}</p>
                <p className="text-[10px] text-text-muted">{post.sound}</p>
              </div>

              <span className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-border px-4 pb-4 pt-4 space-y-4">
                {/* Media sequence */}
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Media Sequence — upload in this order to TikTok
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {mediaFiles.map((f, ti) => (
                      <div key={ti} className="flex-shrink-0 relative">
                        <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-border">
                          {f.kind === 'image' ? (
                            <img src={f.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface flex items-center justify-center relative">
                              <video src={f.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                                  <span className="text-white text-sm">▶</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Order label */}
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow">
                          {ti + 1}
                        </div>
                        {/* File index badge */}
                        <p className="text-[10px] text-text-muted text-center mt-1">
                          File {post.mediaIndices[ti] + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caption + copy */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Caption</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      post.caption.length <= 150
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-gold/10 border-gold/20 text-gold'
                    }`}>
                      {post.caption.length} chars
                    </span>
                  </div>
                  <div className="bg-bg rounded-xl p-3 border border-border">
                    <p className="text-text-primary text-sm leading-relaxed">{post.caption}</p>
                  </div>
                </div>

                {/* Hook */}
                <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-gold font-semibold mb-1">⚡ First 3 seconds</p>
                  <p className="text-xs text-text-secondary">{post.hook}</p>
                </div>

                {/* Hashtags */}
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.hashtags.map(tag => (
                      <span key={tag} className="tag-pill tag-safe">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Sound + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface/50 border border-border">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">🎵 Sound</p>
                    <p className="text-sm text-text-primary">{post.sound}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface/50 border border-border">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">📅 Post At</p>
                    <p className="text-sm text-text-primary">{fmt(schedule[idx])}</p>
                  </div>
                </div>

                {/* Big copy button */}
                <button
                  onClick={() => copyPost(post, idx)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                    copied[idx]
                      ? 'bg-accent/20 border border-accent text-accent'
                      : 'btn-primary'
                  }`}
                >
                  {copied[idx] ? '✓ Copied! Open TikTok and paste' : '📋 Copy Caption + Hashtags'}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* TikTok direct post callout */}
      <div className="glass-card p-5 border-gold/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="text-sm font-bold text-gold mb-1">Auto-Posting (Coming Next)</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Direct TikTok scheduling is in development — will need your TikTok developer account connected.
              For now: copy caption → open TikTok → upload the files in the sequence shown → paste caption → post.
              Takes about 2 minutes per post.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
