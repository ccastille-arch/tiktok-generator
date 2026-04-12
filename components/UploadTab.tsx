'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { BRAND_OVERLAYS, BRAYDEN_STATS, POST_TEMPLATES } from '@/lib/constants'

interface MediaFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video'
  overlayPreset: string | null
  scoreText: string
  locationText: string
  customText: string
}

export default function UploadTab() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [template, setTemplate] = useState('practice-day')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // react-dropzone for desktop drag-and-drop
  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: MediaFile[] = accepted.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image',
      overlayPreset: null,
      scoreText: '',
      locationText: '',
      customText: '',
    }))
    setFiles(prev => {
      const next = [...prev, ...newFiles]
      return next
    })
    if (newFiles.length) {
      setSelected(newFiles[0].id)
      toast.success(`Added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 500 * 1024 * 1024,
    noClick: true, // we handle click separately for mobile
  })

  // Native file picker — works on iOS camera roll
  const openPicker = () => fileInputRef.current?.click()

  const onNativePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    const newFiles: MediaFile[] = picked.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image',
      overlayPreset: null,
      scoreText: '',
      locationText: '',
      customText: '',
    }))
    setFiles(prev => [...prev, ...newFiles])
    setSelected(s => s ?? newFiles[0].id)
    toast.success(`Added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`)
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(f => f.id === id)
      if (f) URL.revokeObjectURL(f.url)
      const next = prev.filter(f => f.id !== id)
      return next
    })
    setSelected(s => (s === id ? null : s))
  }

  const updateSelected = (patch: Partial<MediaFile>) => {
    if (!selected) return
    setFiles(prev => prev.map(f => f.id === selected ? { ...f, ...patch } : f))
  }

  // Drag-to-reorder
  const dragItem = useRef<number | null>(null)

  const onDragStart = (i: number) => { dragItem.current = i }
  const onDragEnterThumb = (i: number) => { setDragOver(files[i]?.id ?? null) }
  const onDragEndThumb = () => { setDragOver(null); dragItem.current = null }

  const onDropThumb = (targetIdx: number) => {
    const from = dragItem.current
    if (from == null || from === targetIdx) { setDragOver(null); return }
    setFiles(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(from, 1)
      arr.splice(targetIdx, 0, moved)
      return arr
    })
    setDragOver(null)
    dragItem.current = null
  }

  const selectedFile = files.find(f => f.id === selected)
  const presetOverlay = selectedFile?.overlayPreset
    ? BRAND_OVERLAYS.find(o => o.id === selectedFile.overlayPreset)
    : null

  const selectedTemplate = POST_TEMPLATES.find(t => t.id === template)!

  const copyPostText = () => {
    if (!selectedFile) return
    const lines = [
      selectedFile.customText,
      selectedFile.scoreText ? `Score: ${selectedFile.scoreText}` : '',
      selectedFile.locationText ? `📍 ${selectedFile.locationText}` : '',
      presetOverlay ? `🏆 ${presetOverlay.label}` : '',
    ].filter(Boolean)
    if (!lines.length) { toast.error('Add some overlay text first'); return }
    navigator.clipboard.writeText(lines.join('\n'))
    toast.success('Overlay text copied!')
  }

  return (
    <div className="space-y-4">
      {/* Hidden native input — accepts image+video, multiple, works on iOS */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        onChange={onNativePick}
      />

      {/* Mobile-first upload zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center transition-all
          ${isDragActive ? 'border-accent bg-accent/10 glow-green' : 'border-border bg-surface/30'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-2">📸</div>
        <p className="text-text-primary font-semibold text-base">Upload from Camera Roll</p>
        <p className="text-text-muted text-xs mt-1 mb-4">Photos & videos · JPG, PNG, MP4, MOV</p>
        <button
          type="button"
          onClick={openPicker}
          className="btn-primary px-8 py-3 text-base w-full max-w-xs mx-auto block"
        >
          Choose Photos / Videos
        </button>
        <p className="text-text-muted text-xs mt-3 hidden md:block">
          Or drag &amp; drop files here
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: thumbnail grid with reorder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Media ({files.length}) <span className="normal-case font-normal text-text-muted">— drag to reorder</span>
              </h3>
              <button
                onClick={() => { files.forEach(f => URL.revokeObjectURL(f.url)); setFiles([]); setSelected(null) }}
                className="text-xs text-text-muted hover:text-danger transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnterThumb(i)}
                  onDragEnd={onDragEndThumb}
                  onDrop={() => onDropThumb(i)}
                  onDragOver={e => e.preventDefault()}
                  className={`
                    relative rounded-xl overflow-hidden cursor-pointer border-2 aspect-square transition-all
                    ${selected === f.id ? 'border-accent shadow-lg shadow-accent/20' : 'border-transparent hover:border-border/60'}
                    ${dragOver === f.id ? 'border-gold scale-95 opacity-80' : ''}
                  `}
                  onClick={() => setSelected(f.id)}
                >
                  {/* Order badge */}
                  <div className="absolute top-1 left-1 z-10 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-[10px] font-bold text-white">
                    {i + 1}
                  </div>

                  {f.type === 'image' ? (
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center relative">
                      <video src={f.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs">▶</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={e => { e.stopPropagation(); removeFile(f.id) }}
                    className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white text-xs hover:bg-danger/90 transition-colors"
                  >
                    ×
                  </button>

                  {/* Overlay indicator */}
                  {(f.scoreText || f.overlayPreset || f.customText) && (
                    <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-accent" title="Has overlay" />
                  )}
                </div>
              ))}

              {/* Add more button */}
              <button
                onClick={openPicker}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-accent transition-all"
              >
                <span className="text-xl">+</span>
                <span className="text-[10px]">Add more</span>
              </button>
            </div>

            {/* Slideshow order note */}
            {files.length > 1 && (
              <p className="text-xs text-text-muted text-center">
                📐 Drag thumbnails to set slideshow order
              </p>
            )}
          </div>

          {/* Center + Right: selected file editor */}
          <div className="lg:col-span-2 space-y-4">
            {selectedFile ? (
              <>
                {/* Preview with overlays */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                      Preview — {files.findIndex(f => f.id === selectedFile.id) + 1} of {files.length}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const i = files.findIndex(f => f.id === selectedFile.id)
                          if (i > 0) setSelected(files[i - 1].id)
                        }}
                        disabled={files.findIndex(f => f.id === selectedFile.id) === 0}
                        className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => {
                          const i = files.findIndex(f => f.id === selectedFile.id)
                          if (i < files.length - 1) setSelected(files[i + 1].id)
                        }}
                        disabled={files.findIndex(f => f.id === selectedFile.id) === files.length - 1}
                        className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    {/* Phone frame */}
                    <div className="flex-shrink-0 phone-frame w-36" style={{ height: '200px' }}>
                      {selectedFile.type === 'image' ? (
                        <img src={selectedFile.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={selectedFile.url} controls playsInline className="w-full h-full object-cover" />
                      )}
                      {/* Overlay layer */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                        {selectedFile.scoreText && (
                          <div style={{ fontFamily: 'Impact, sans-serif', color: '#f59e0b', fontSize: '18px', lineHeight: 1, textShadow: '1px 1px 2px black' }}>
                            {selectedFile.scoreText}
                          </div>
                        )}
                        {selectedFile.locationText && (
                          <div style={{ color: '#fff', fontSize: '9px', textShadow: '1px 1px 1px black' }}>
                            📍 {selectedFile.locationText}
                          </div>
                        )}
                        {presetOverlay && (
                          <div style={{ color: presetOverlay.color, fontSize: '9px', fontWeight: 'bold', textShadow: '1px 1px 1px black' }}>
                            {presetOverlay.label}
                          </div>
                        )}
                        {selectedFile.customText && (
                          <div style={{ color: '#fff', fontSize: '9px', textShadow: '1px 1px 1px black' }}>
                            {selectedFile.customText}
                          </div>
                        )}
                        <div style={{ color: '#22c55e', fontSize: '8px', marginTop: 2 }}>{BRAYDEN_STATS.handle}</div>
                      </div>
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-text-primary text-sm font-medium truncate">{selectedFile.file.name}</p>
                      <p className="text-text-muted text-xs">{(selectedFile.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
                        selectedFile.type === 'video'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-accent/10 border-accent/30 text-accent'
                      }`}>
                        {selectedFile.type === 'video' ? '🎬 Video' : '📸 Photo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overlay editor */}
                <div className="glass-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Text Overlays — Slide {files.findIndex(f => f.id === selectedFile.id) + 1}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Score / Number</label>
                      <input
                        value={selectedFile.scoreText}
                        onChange={e => updateSelected({ scoreText: e.target.value })}
                        placeholder="e.g. 270 / 12 Ring"
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Location / Tournament</label>
                      <input
                        value={selectedFile.locationText}
                        onChange={e => updateSelected({ locationText: e.target.value })}
                        placeholder="e.g. ASA Pro/Am"
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Custom Text</label>
                    <input
                      value={selectedFile.customText}
                      onChange={e => updateSelected({ customText: e.target.value })}
                      placeholder="e.g. 180 arrows after school"
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Brand Badge</label>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_OVERLAYS.map(o => (
                        <button
                          key={o.id}
                          onClick={() => updateSelected({ overlayPreset: selectedFile.overlayPreset === o.id ? null : o.id })}
                          style={selectedFile.overlayPreset === o.id ? { borderColor: o.color, color: o.color, background: `${o.color}20` } : {}}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            selectedFile.overlayPreset === o.id ? '' : 'bg-surface border-border text-text-secondary hover:border-border/80'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={copyPostText} className="btn-secondary w-full py-2 text-sm">
                    📋 Copy Overlay Text for This Slide
                  </button>
                </div>

                {/* Template select + checklist */}
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Post Template</h3>
                  <select
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent mb-3"
                  >
                    {POST_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                    ))}
                  </select>

                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-text-muted font-medium">Caption starters:</p>
                    {selectedTemplate.captionHooks.map((hook, i) => (
                      <div
                        key={i}
                        onClick={() => navigator.clipboard.writeText(hook).then(() => toast.success('Copied!'))}
                        className="text-xs text-text-secondary bg-surface/50 rounded-lg p-2 border border-border hover:border-accent/40 cursor-pointer transition-colors"
                      >
                        "{hook}"
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card p-10 text-center">
                <p className="text-text-muted">Tap a thumbnail to edit overlays</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile post checklist — always visible */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">📱 Post Checklist</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: '📐', text: 'Vertical 9:16 format' },
            { icon: '☀️', text: 'Good lighting' },
            { icon: '🔢', text: 'Score visible' },
            { icon: '🎵', text: 'Trending sound picked' },
            { icon: '📝', text: 'Caption + hashtags ready' },
            { icon: '🏅', text: 'Brand badge added' },
            { icon: '⏰', text: 'Peak time post' },
            { icon: '💬', text: 'Reply to comments' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 text-xs text-text-secondary">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
