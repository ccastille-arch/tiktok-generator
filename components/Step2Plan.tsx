'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { MediaFile, GeneratedPost } from '@/app/page'

interface Props {
  files: MediaFile[]
  onBack: () => void
  onGenerated: (posts: GeneratedPost[]) => void
  onStreamStart: (postCount: number) => void
  onPostReady: (post: GeneratedPost) => void
}

export default function Step2Plan({ files, onBack, onGenerated, onStreamStart, onPostReady }: Props) {
  const [postCount, setPostCount] = useState(3)
  const [tournament, setTournament] = useState('')
  const [scores, setScores] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const maxPosts = Math.min(10, files.length)

  const generate = async () => {
    setLoading(true)
    setProgress(0)
    const collected: GeneratedPost[] = []

    try {
      const fileMeta = files.map((f, i) => ({ i, kind: f.kind }))

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'batch', files: fileMeta, postCount, tournament, scores, notes }),
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      if (!res.body) throw new Error('No response body')

      // Signal parent: go to Step3 immediately in loading state
      onStreamStart(postCount)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            if (data.post) {
              collected.push(data.post as GeneratedPost)
              setProgress(collected.length)
              onPostReady(data.post as GeneratedPost)
            }
            if (data.error) {
              console.warn('Stream error:', data.error)
            }
            if (data.done) {
              onGenerated(collected)
            }
          } catch {
            // malformed line, skip
          }
        }
      }

      if (collected.length === 0) throw new Error('No posts generated')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed: ${msg}`)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
        ← Back ({files.length} files)
      </button>

      {/* How many posts */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-text-primary mb-1">How many TikTok posts?</h2>
        <p className="text-text-muted text-sm mb-5">
          AI splits your {files.length} files across {postCount} post{postCount > 1 ? 's' : ''} — captions, hashtags, media order, all of it.
        </p>

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

      {/* Context */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary mb-0.5">
          Add context <span className="text-text-muted font-normal">(optional but makes captions way better)</span>
        </h3>

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
          <label className="text-xs text-text-muted mb-1 block">Anything else?</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. dad was scoring, tried new bow, early morning practice..."
            rows={2}
            className="caption-textarea w-full px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={loading}
        className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Building posts… {progress > 0 ? `(${progress}/${postCount} ready)` : ''}</span>
          </>
        ) : (
          <>✨ Generate {postCount} TikTok Post{postCount > 1 ? 's' : ''}</>
        )}
      </button>
    </div>
  )
}
