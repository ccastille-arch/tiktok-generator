'use client'

import { useState } from 'react'
import { POST_TEMPLATES, BRAYDEN_STATS, BRAND_OVERLAYS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function TemplatesTab() {
  const [selected, setSelected] = useState(POST_TEMPLATES[0].id)
  const [score, setScore] = useState('')
  const [tournament, setTournament] = useState('')
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)

  const template = POST_TEMPLATES.find(t => t.id === selected)!

  const buildCaption = () => {
    const hook = template.captionHooks[0]
      .replace('[Tournament Name]', tournament || 'the tournament')
      .replace('[Tournament]', tournament || 'the tournament')
      .replace('[SCORE]', score || 'a new record')
      .replace('[X]', '7')

    const overlay = selectedOverlay
      ? BRAND_OVERLAYS.find(o => o.id === selectedOverlay)?.label
      : null

    const tags = '#archery #3darchery #asaarchery #competitivearchery #youtharchery #youngathlete'

    const caption = `${hook}\n\n${score ? `📊 Score: ${score}\n` : ''}${tournament ? `📍 ${tournament}\n` : ''}${overlay ? `\n🏆 ${overlay}\n` : ''}\n${tags}`
    navigator.clipboard.writeText(caption)
    toast.success('Template caption copied!')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Post Templates</h2>
        {POST_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`
              w-full p-4 rounded-xl border text-left transition-all
              ${selected === t.id
                ? 'bg-accent/10 border-accent/50 glow-green'
                : 'glass-card hover:border-border/80'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <div className="font-semibold text-text-primary">{t.name}</div>
                <div className="text-xs text-text-muted">{t.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Template detail */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{template.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{template.name}</h2>
              <p className="text-text-secondary text-sm">{template.description}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Score / Achievement</label>
              <input
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder={template.id === 'new-personal-best' ? 'e.g. 294' : 'Optional'}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Tournament / Event</label>
              <input
                value={tournament}
                onChange={e => setTournament(e.target.value)}
                placeholder="e.g. ASA Pro/Am"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Suggested hooks */}
          <div className="mb-4">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">Caption Hooks:</p>
            <div className="space-y-2">
              {template.captionHooks.map((hook, i) => (
                <div
                  key={i}
                  onClick={() => navigator.clipboard.writeText(hook).then(() => toast.success('Hook copied!'))}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border hover:border-accent/40 cursor-pointer group transition-all"
                >
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">{hook}</span>
                  <span className="text-xs text-text-muted group-hover:text-accent">Copy</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sounds */}
          <div className="mb-4">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">Suggested Sounds:</p>
            <div className="flex flex-wrap gap-2">
              {template.suggestedSounds.map(s => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary">
                  🎵 {s}
                </span>
              ))}
            </div>
          </div>

          {/* Brand overlays */}
          <div className="mb-4">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">Brand Overlay Text:</p>
            <div className="flex flex-wrap gap-2">
              {BRAND_OVERLAYS.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOverlay(selectedOverlay === o.id ? null : o.id)}
                  style={selectedOverlay === o.id ? { borderColor: o.color, color: o.color, background: `${o.color}15` } : {}}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedOverlay === o.id
                      ? ''
                      : 'bg-surface border-border text-text-secondary hover:border-border/80'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={buildCaption} className="btn-primary w-full py-3">
            📋 Copy Template Caption
          </button>
        </div>

        {/* TikTok phone preview */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Post Preview</h3>
          <div className="flex justify-center">
            <div className="phone-frame w-48" style={{ height: '256px' }}>
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                    <span className="text-xs">+</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-white text-xs font-bold leading-tight">
                    {BRAYDEN_STATS.handle}
                  </div>
                  <div className="text-white/80 text-[10px] leading-tight">
                    {template.captionHooks[0].replace('[Tournament Name]', tournament || '...')
                     .replace('[SCORE]', score || '...')
                     .replace('[Tournament]', tournament || '...')}
                  </div>
                  {selectedOverlay && (
                    <div
                      className="text-[10px] font-bold"
                      style={{ color: BRAND_OVERLAYS.find(o => o.id === selectedOverlay)?.color }}
                    >
                      {BRAND_OVERLAYS.find(o => o.id === selectedOverlay)?.label}
                    </div>
                  )}
                  {score && (
                    <div className="text-[10px]" style={{ color: '#f59e0b', fontFamily: 'Impact, sans-serif' }}>
                      Score: {score}
                    </div>
                  )}
                </div>
              </div>
              {/* Center archery icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <span className="text-4xl">🏹</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
