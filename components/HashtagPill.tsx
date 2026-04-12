'use client'

interface HashtagPillProps {
  tag: string
  selected?: boolean
  variant?: 'safe' | 'danger' | 'trending' | 'selected'
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
}

export default function HashtagPill({ tag, selected, variant, onClick, removable, onRemove }: HashtagPillProps) {
  const cls = selected || variant === 'selected' ? 'tag-selected'
    : variant === 'danger' ? 'tag-danger'
    : variant === 'trending' ? 'tag-trending'
    : 'tag-safe'

  return (
    <span
      className={`tag-pill ${cls} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {tag}
      {removable && (
        <button
          onClick={e => { e.stopPropagation(); onRemove?.() }}
          className="ml-0.5 hover:text-white opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  )
}
