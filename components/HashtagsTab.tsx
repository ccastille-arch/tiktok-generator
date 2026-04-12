'use client'

import { useState } from 'react'
import { SAFE_HASHTAGS, BLACKLISTED_HASHTAGS, TRENDING_HASHTAGS } from '@/lib/constants'
import toast from 'react-hot-toast'

const CATEGORIES = [
  {
    name: 'Core Archery',
    tags: ['#archery', '#archer', '#archerylife', '#archerylove', '#archerynation', '#archeryworld'],
  },
  {
    name: 'Competition',
    tags: ['#3darchery', '#asaarchery', '#targetarchery', '#competitivearchery', '#archerycompetition', '#iboarchery'],
  },
  {
    name: 'Youth Athlete',
    tags: ['#youtharchery', '#youngathlete', '#youthsports', '#youngchampion', '#kidsports'],
  },
  {
    name: 'Gear',
    tags: ['#compoundbow', '#trx34', '#bowtech', '#bowandarrow', '#arrowflight', '#bowsports', '#a3archery'],
  },
  {
    name: 'Lifestyle',
    tags: ['#outdoorlife', '#outdoors', '#sportslife', '#athletelife', '#targetpractice'],
  },
  {
    name: 'Achievement',
    tags: ['#statechampion', '#personalrecord', '#eaglepins', '#shooterOfTheYear', '#champions'],
  },
]

const BLACKLIST_DISPLAY = [
  '#bowhunt', '#bowhunting', '#hunting', '#deerhunting', '#huntinglife',
  '#bowhunter', '#huntin', '#bowhuntinglife', '#deerhunter', '#huntingseason',
  '#wildlifehunting', '#buckhunting', '#predatorhunting', '#trophyhunting',
]

export default function HashtagsTab() {
  const [activeSet, setActiveSet] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [warningTag, setWarningTag] = useState<string | null>(null)

  const toggle = (tag: string) => {
    setActiveSet(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const addCustom = () => {
    const clean = customInput.trim().replace(/^#/, '').toLowerCase()
    if (!clean) return

    if (BLACKLISTED_HASHTAGS.has(clean)) {
      setWarningTag(`#${clean}`)
      toast.error(`🚫 #${clean} is BLACKLISTED — TikTok will flag this!`, {
        duration: 5000,
        style: { background: '#1a0a0a', border: '1px solid #ef4444', color: '#fca5a5' },
      })
      setCustomInput('')
      setTimeout(() => setWarningTag(null), 4000)
      return
    }

    const tag = `#${clean}`
    if (!activeSet.includes(tag)) {
      setActiveSet(prev => [...prev, tag])
      toast.success(`Added ${tag}`)
    }
    setCustomInput('')
  }

  const copySet = () => {
    if (!activeSet.length) { toast.error('No hashtags selected'); return }
    navigator.clipboard.writeText(activeSet.join(' '))
    toast.success(`Copied ${activeSet.length} hashtags!`)
  }

  const clearSet = () => { setActiveSet([]); toast.success('Cleared') }

  const useOptimal = () => {
    const optimal = ['#archery', '#3darchery', '#asaarchery', '#competitivearchery', '#youtharchery',
      '#youngathlete', '#statechampion', '#archerylife', '#targetarchery', '#trx34',
      '#a3archery', '#eaglepins', '#bowsports', '#archerynation']
    setActiveSet(optimal)
    toast.success('Optimal set loaded!')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Categories */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Safe Hashtag Library</h2>
          <div className="flex gap-2">
            <button onClick={useOptimal} className="btn-secondary text-xs px-3 py-1.5">⭐ Optimal Set</button>
            <button onClick={clearSet} className="btn-secondary text-xs px-3 py-1.5">Clear</button>
          </div>
        </div>

        {/* Trending */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gold">🔥</span>
            <h3 className="text-sm font-semibold text-gold">Trending Now</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TRENDING_HASHTAGS.map(tag => (
              <span
                key={tag}
                onClick={() => toggle(tag)}
                className={`tag-pill cursor-pointer ${activeSet.includes(tag) ? 'tag-selected' : 'tag-trending'}`}
              >
                {tag} {activeSet.includes(tag) && '✓'}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        {CATEGORIES.map(cat => (
          <div key={cat.name} className="glass-card p-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{cat.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              {cat.tags.map(tag => (
                <span
                  key={tag}
                  onClick={() => toggle(tag)}
                  className={`tag-pill cursor-pointer ${activeSet.includes(tag) ? 'tag-selected' : 'tag-safe'}`}
                >
                  {tag} {activeSet.includes(tag) && '✓'}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Blacklist warning section */}
        <div className="glass-card p-4 border-danger/20 bg-danger/5">
          <div className="flex items-center gap-2 mb-3">
            <span>🚫</span>
            <h3 className="text-sm font-semibold text-danger">Blacklisted Hashtags</h3>
            <span className="text-xs text-text-muted ml-1">— TikTok flags/removes these</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BLACKLIST_DISPLAY.map(tag => (
              <span key={tag} className="tag-pill tag-danger cursor-not-allowed" title="TikTok flags this hashtag">
                {tag} 🚫
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3">
            These hunting/bowhunting hashtags will get your content flagged or removed on TikTok.
            The app will warn you if you try to use any of these.
          </p>
        </div>
      </div>

      {/* Right: Active set */}
      <div className="space-y-4">
        {/* Warning banner */}
        {warningTag && (
          <div className="p-4 rounded-xl border border-danger/50 bg-danger/10 animate-pulse">
            <p className="text-danger font-bold text-sm">⚠️ BLACKLISTED HASHTAG</p>
            <p className="text-danger/80 text-xs mt-1">{warningTag} is flagged by TikTok and can get your content removed!</p>
          </div>
        )}

        {/* Custom add */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Add Custom Tag</h3>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="#yourhashtag"
              className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button onClick={addCustom} className="btn-primary px-4 py-2 text-sm">Add</button>
          </div>
          <p className="text-xs text-text-muted mt-2">Will warn you if the tag is blacklisted</p>
        </div>

        {/* Current set */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Your Set ({activeSet.length})
            </h3>
            <span className={`text-xs font-medium ${activeSet.length > 15 ? 'text-danger' : activeSet.length >= 8 ? 'text-accent' : 'text-text-muted'}`}>
              {activeSet.length > 15 ? '⚠️ Too many' : activeSet.length >= 8 ? '✅ Good' : 'Add more'}
            </span>
          </div>

          {activeSet.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">Click tags to add them</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {activeSet.map(tag => (
                <span
                  key={tag}
                  onClick={() => toggle(tag)}
                  className="tag-pill tag-selected cursor-pointer"
                >
                  {tag} ×
                </span>
              ))}
            </div>
          )}

          {activeSet.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-mono text-text-muted bg-bg rounded-lg p-2 break-all max-h-24 overflow-y-auto">
                {activeSet.join(' ')}
              </div>
              <button onClick={copySet} className="btn-primary w-full py-2 text-sm">
                📋 Copy {activeSet.length} Hashtags
              </button>
            </div>
          )}
        </div>

        {/* Rules reminder */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Hashtag Rules</h3>
          <ul className="space-y-1.5 text-xs text-text-muted">
            <li className="flex gap-2"><span className="text-accent">✓</span> Use 8–15 hashtags per post</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Mix broad + niche tags</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Include 1–2 trending tags</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Always include #archery</li>
            <li className="flex gap-2"><span className="text-danger">✗</span> No hunting hashtags</li>
            <li className="flex gap-2"><span className="text-danger">✗</span> Don't use 30+ hashtags (spam)</li>
            <li className="flex gap-2"><span className="text-danger">✗</span> Never repeat same set every post</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
