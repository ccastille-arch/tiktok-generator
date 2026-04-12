'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { POST_TEMPLATES, SAFE_HASHTAGS, BLACKLISTED_HASHTAGS } from '@/lib/constants'
import HashtagPill from './HashtagPill'

interface GeneratedContent {
  captions: { variation: string; text: string; charCount: number }[]
  hashtags: string[]
  hook: string
  sounds: string[]
  tips: string[]
}

export default function GeneratorTab() {
  const [template, setTemplate] = useState('practice-day')
  const [score, setScore] = useState('')
  const [tournament, setTournament] = useState('')
  const [context, setContext] = useState('')
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [selectedCaption, setSelectedCaption] = useState(0)
  const [customTag, setCustomTag] = useState('')

  const selectedTemplate = POST_TEMPLATES.find(t => t.id === template)!

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: selectedTemplate.name, score, tournament, context, selectedHashtags }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data)
      setSelectedCaption(0)
      toast.success('Content generated!')
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err)
      toast.error(`Generation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const addCustomTag = () => {
    const clean = customTag.trim().replace(/^#/, '').toLowerCase()
    if (!clean) return
    if (BLACKLISTED_HASHTAGS.has(clean)) {
      toast.error(`🚫 #${clean} is blacklisted — TikTok flags this hashtag!`, { duration: 4000 })
      setCustomTag('')
      return
    }
    const tag = `#${clean}`
    if (!selectedHashtags.includes(tag)) {
      setSelectedHashtags(prev => [...prev, tag])
      toast.success(`Added ${tag}`)
    }
    setCustomTag('')
  }

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const copyCaption = () => {
    if (!result) return
    const caption = result.captions[selectedCaption].text
    const tags = (result.hashtags || []).concat(selectedHashtags).join(' ')
    navigator.clipboard.writeText(`${caption}\n\n${tags}`)
    toast.success('Copied to clipboard!')
  }

  const finalHashtags = result
    ? Array.from(new Set([...result.hashtags, ...selectedHashtags]))
    : selectedHashtags

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-4">
        {/* Template selector */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Post Template</h3>
          <div className="grid grid-cols-2 gap-2">
            {POST_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${template === t.id
                    ? 'bg-accent/15 border-accent/60 text-text-primary'
                    : 'bg-surface/50 border-border text-text-secondary hover:border-border/80'
                  }
                `}
              >
                <div className="text-lg mb-1">{t.icon}</div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Context fields */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Post Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Score (if applicable)</label>
              <input
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 270 with 8 12-rings"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Tournament / Location</label>
              <input
                value={tournament}
                onChange={e => setTournament(e.target.value)}
                placeholder="e.g. ASA Pro/Am, home range"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">What happened? (raw notes)</label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g. 180 arrows after school, worked on form, dad was scoring..."
              rows={3}
              className="caption-textarea w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Hashtag selector */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Hashtag Picks <span className="text-text-muted font-normal normal-case">(select to include)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SAFE_HASHTAGS.slice(0, 18).map(tag => (
              <HashtagPill
                key={tag}
                tag={tag}
                selected={selectedHashtags.includes(tag)}
                onClick={() => toggleHashtag(tag)}
              />
            ))}
          </div>

          {/* Custom tag input */}
          <div className="flex gap-2 mt-3">
            <input
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Add custom hashtag..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <button onClick={addCustomTag} className="btn-secondary px-3 py-1.5 text-sm">Add</button>
          </div>

          {selectedHashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedHashtags.map(tag => (
                <span
                  key={tag}
                  onClick={() => toggleHashtag(tag)}
                  className="tag-pill tag-selected cursor-pointer"
                >
                  {tag} ×
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating with Claude AI...
            </>
          ) : (
            <>✨ Generate TikTok Content</>
          )}
        </button>
      </div>

      {/* Right: Output */}
      <div className="space-y-4">
        {!result ? (
          <div className="glass-card p-8 text-center space-y-3">
            <div className="text-5xl">🎬</div>
            <h3 className="text-lg font-semibold text-text-primary">Ready to create</h3>
            <p className="text-text-muted text-sm">
              Generates captions in Brayden's real voice — short, humble, kid-working-hard energy.
            </p>

            {/* Style examples */}
            <div className="mt-4 space-y-1.5">
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Real caption examples:</p>
              {[
                '"180 arrows after school on a Tuesday"',
                '"11 year Old Future Pro Shooter"',
                '"Nailed 12 Ring!"',
                '"Dad\'s Scores — Cuts me no slack"',
                '"New Toy!!"',
              ].map((ex, i) => (
                <div key={i} className="text-xs text-text-secondary bg-surface/50 rounded-lg p-2 border border-border text-left">
                  {ex}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-text-muted">Suggested sounds for {selectedTemplate.name}:</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {selectedTemplate.suggestedSounds.map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                    🎵 {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Caption variations */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Caption Variations</h3>
                <button onClick={copyCaption} className="btn-secondary text-xs px-3 py-1.5">
                  📋 Copy
                </button>
              </div>

              {/* Variation tabs */}
              <div className="flex gap-1 mb-3">
                {result.captions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCaption(i)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                      selectedCaption === i
                        ? 'bg-accent/20 border-accent/50 text-accent'
                        : 'bg-surface/30 border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {c.variation}
                  </button>
                ))}
              </div>

              {/* Selected caption */}
              <div className="bg-bg rounded-lg p-3 border border-border">
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                  {result.captions[selectedCaption].text}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${result.captions[selectedCaption].charCount > 300 ? 'text-danger' : 'text-text-muted'}`}>
                    {result.captions[selectedCaption].charCount} chars
                  </span>
                  <span className="text-xs text-text-muted">
                    {result.captions[selectedCaption].charCount <= 150 ? '✅ Optimal' :
                     result.captions[selectedCaption].charCount <= 300 ? '👍 Good' : '⚠️ Long'}
                  </span>
                </div>
              </div>

              {/* Hook */}
              {result.hook && (
                <div className="mt-3 p-2 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-gold font-medium">⚡ First 3-second hook:</p>
                  <p className="text-xs text-text-secondary mt-1">{result.hook}</p>
                </div>
              )}
            </div>

            {/* Generated hashtags */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Safe Hashtags <span className="text-text-muted normal-case font-normal">({finalHashtags.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {finalHashtags.map(tag => (
                  <span key={tag} className="tag-pill tag-safe">{tag}</span>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(finalHashtags.join(' '))
                  toast.success('Hashtags copied!')
                }}
                className="btn-secondary text-xs px-3 py-1.5 mt-3 w-full"
              >
                Copy All Hashtags
              </button>
            </div>

            {/* Sounds & Tips */}
            <div className="grid grid-cols-2 gap-3">
              {result.sounds?.length > 0 && (
                <div className="glass-card p-3">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">🎵 Trending Sounds</h3>
                  <ul className="space-y-1">
                    {result.sounds.map((s, i) => (
                      <li key={i} className="text-xs text-text-secondary">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.tips?.length > 0 && (
                <div className="glass-card p-3">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">💡 Tips</h3>
                  <ul className="space-y-1">
                    {result.tips.map((t, i) => (
                      <li key={i} className="text-xs text-text-secondary">• {t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              {loading ? '⏳ Regenerating...' : '🔄 Regenerate Variations'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
