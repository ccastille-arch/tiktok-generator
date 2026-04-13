'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Step1Upload from '@/components/Step1Upload'
import Step2Plan from '@/components/Step2Plan'
import Step3Results from '@/components/Step3Results'

export interface MediaFile {
  id: string
  file: File
  url: string
  kind: 'image' | 'video'
}

export interface GeneratedPost {
  postNumber: number
  title: string
  mediaIndices: number[]
  caption: string
  hashtags: string[]
  hook: string
  sound: string
  postTime: string
  vibe: string
}

export type Step = 1 | 2 | 3

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [posts, setPosts] = useState<GeneratedPost[]>([])

  const goTo = (s: Step) => setStep(s)

  return (
    <div className="hero-gradient min-h-screen">
      <Header />

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {(['Upload Media', 'Set Up', 'Your Posts'] as const).map((label, i) => {
            const num = (i + 1) as Step
            const active = step === num
            const done = step > num
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${done ? 'bg-accent text-white' : active ? 'bg-accent text-white ring-2 ring-accent/30' : 'bg-surface border border-border text-text-muted'}
                  `}>
                    {done ? '✓' : num}
                  </div>
                  <span className={`text-sm hidden sm:inline transition-colors ${active ? 'text-text-primary font-medium' : done ? 'text-accent' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`h-px flex-1 transition-colors ${done ? 'bg-accent/50' : 'bg-border'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 pt-4">
        {step === 1 && (
          <Step1Upload
            files={files}
            setFiles={setFiles}
            onNext={() => goTo(2)}
          />
        )}
        {step === 2 && (
          <Step2Plan
            files={files}
            onBack={() => goTo(1)}
            onGenerated={(p) => { setPosts(p); goTo(3) }}
          />
        )}
        {step === 3 && (
          <Step3Results
            files={files}
            posts={posts}
            onReset={() => { setFiles([]); setPosts([]); goTo(1) }}
            onBack={() => goTo(2)}
          />
        )}
      </div>
    </div>
  )
}
