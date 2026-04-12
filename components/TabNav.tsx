'use client'

import { Tab } from '@/app/page'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'generate', label: 'AI Generator', icon: '✨' },
  { id: 'templates', label: 'Templates', icon: '📋' },
  { id: 'hashtags', label: 'Hashtags', icon: '#' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'upload', label: 'Media', icon: '📸' },
]

export default function TabNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            transition-all duration-150 flex-1 justify-center
            ${active === tab.id
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-border/30'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
