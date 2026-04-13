'use client'

import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { MediaFile } from '@/app/page'

interface Props {
  files: MediaFile[]
  setFiles: (f: MediaFile[] | ((prev: MediaFile[]) => MediaFile[])) => void
  onNext: () => void
}

export default function Step1Upload({ files, setFiles, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return
    const newFiles: MediaFile[] = accepted.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      url: URL.createObjectURL(f),
      kind: f.type.startsWith('video') ? 'video' : 'image',
    }))
    setFiles(prev => {
      const existing = new Set(prev.map(p => p.file.name + p.file.size))
      const deduped = newFiles.filter(n => !existing.has(n.file.name + n.file.size))
      return [...prev, ...deduped]
    })
    toast.success(`Added ${accepted.length} file${accepted.length > 1 ? 's' : ''}`)
  }, [setFiles])

  const onDrop = useCallback((accepted: File[]) => addFiles(accepted), [addFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    noClick: true,
  })

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(f => f.id === id)
      if (f) URL.revokeObjectURL(f.url)
      return prev.filter(f => f.id !== id)
    })
  }

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.url))
    setFiles([])
  }

  const imageCount = files.filter(f => f.kind === 'image').length
  const videoCount = files.filter(f => f.kind === 'video').length

  return (
    <div className="space-y-5">
      {/* Hero drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all
          ${isDragActive ? 'border-accent bg-accent/10 glow-green' : files.length ? 'border-accent/40 bg-surface/20' : 'border-border bg-surface/30'}
        `}
      >
        <input {...getInputProps()} />
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="sr-only"
          onChange={onPick}
        />

        {files.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Dump your competition photos & videos here</h2>
            <p className="text-text-muted text-sm mb-6">
              Select your whole camera roll from today — photos, videos, everything.<br/>
              AI will sort it all into posts for you.
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-primary px-10 py-4 text-lg mx-auto block"
            >
              Choose Photos & Videos
            </button>
            <p className="text-text-muted text-xs mt-4">JPG · PNG · MP4 · MOV — up to 500MB each</p>
          </div>
        ) : (
          /* Filled state */
          <div className="p-4">
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-accent">{files.length}</span>
                  <span className="text-text-secondary text-sm">files</span>
                </div>
                {imageCount > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
                    📸 {imageCount} photos
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    🎬 {videoCount} videos
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  + Add more
                </button>
                <button onClick={clearAll} className="text-xs text-text-muted hover:text-danger transition-colors px-2">
                  Clear all
                </button>
              </div>
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-64 overflow-y-auto pb-1">
              {files.map((f, i) => (
                <div
                  key={f.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border/50 group"
                >
                  {f.kind === 'image' ? (
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface/80">
                      <video src={f.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                          <span className="text-[9px] text-white">▶</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Index badge */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-black/60 flex items-center justify-center text-[9px] font-bold text-white">
                    {i + 1}
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => removeFile(f.id)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-black/60 flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 hover:bg-danger/80 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {isDragActive && (
              <div className="absolute inset-0 bg-accent/10 rounded-2xl border-2 border-accent flex items-center justify-center">
                <p className="text-accent font-bold text-lg">Drop to add</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      {files.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📷', text: 'Grab your whole camera roll from today' },
            { icon: '🎬', text: 'Mix photos AND videos — AI handles it' },
            { icon: '🏆', text: 'Include score boards, awards, range shots' },
            { icon: '👨‍👦', text: 'Behind-the-scenes, dad scoring — all of it' },
          ].map(t => (
            <div key={t.text} className="glass-card p-3 text-center">
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className="text-xs text-text-muted">{t.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next button */}
      {files.length > 0 && (
        <button
          onClick={onNext}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          Next: Set Up Your Posts →
          <span className="text-sm font-normal opacity-80">({files.length} files ready)</span>
        </button>
      )}
    </div>
  )
}
