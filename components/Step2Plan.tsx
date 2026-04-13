'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { MediaFile, GeneratedPost } from '@/app/page'

interface Props {
  files: MediaFile[]
  onBack: () => void
  onGenerated: (posts: GeneratedPost[]) => void
}

export default function Step2Plan({ files, onBack, onGenerated }: Props) {
  const [postCount, setPostCount] = useState(3)
  const [tournament, setTournament] = useState('')
  const [scores, setScores] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const maxPosts = Math.min(10, files.length)

  const generate = async () => {
    setLoading(true)
    try {
      // Send only index + kind — Claude doesn't need filenames, keeps payload small & fast
      const fileMeta = files.map((f, i) => ({
        i,
        kind: f.kind,
      }))

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'batch',
          files: fileMeta,
          postCount,
          tournament,
          scores,
          notes,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      onGenerated(data.posts)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Back link */}
      <button onClick={onBack} className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
        ← Back ({files.length} files)
      </button>

      {/* How many posts */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-text-primary mb-1">How many TikTok posts?</h2>
        <p className="text-text-muted text-sm mb-5">
          AI will split your {files.length} files across {postCount} post{postCount > 1 ? 's' : ''} — captions, hashtags, media order, all of it.
        </p>

        {/* Count grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
          {Array.from({ length: maxPosts }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPostCount(n)}
              className={`
                aspect-square rounded-xl text-xl font-bold transition-all border-2
                ${postCount === n
                  ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25 scale-105'
                  : 'bg-surface border-border text-text-secondary hover:border-accent/40 hover:text-text-primary'
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Media per post indicator */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border">
          <div className="text-accent text-xl">🎬</div>
          <div>
            <p className="text-sm text-text-primary font-medium">
              ~{Math.ceil(files.length / postCount)} files per post
            </p>
            <p className="text-xs text-text-muted">
              AI picks the best groupings from your {files.length} files
            </p>
          </div>
        </div>
      </div>

      {/* Optional context */}
      <div className="glass-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-0.5">Add context <span className="text-text-muted font-normal">(optional but makes captions way better)</span></h3>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Tournament / Event</label>
          <input
            value={tournament}
            onChange={e => setTournament(e.target.value)}
            placeholder="e.g. ASA Pro/Am, State Championship, home range"
            className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Scores / Results</label>
          <input
            value={scores}
            onChange={e => setScores(e.target.value)}
            placeholder="e.g. 270 with 8 12-rings, finished 2nd overall"
            className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Anything else to know?</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. dad was scoring today, tried a new bow, early morning practice..."
            rows={2}
            className="caption-textarea w-full px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading}
        className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>AI is building your {postCount} posts…</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Generate {postCount} TikTok Post{postCount > 1 ? 's' : ''}</span>
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-xs text-text-muted animate-pulse">
          Analyzing your {files.length} files and writing captions in Brayden's voice…
        </p>
      )}
    </div>
  )
}
