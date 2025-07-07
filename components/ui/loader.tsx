'use client'

import { useTranslation } from 'react-i18next'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  text?: string
  className?: string
  progress?: number // 0-100 for progress-based loading
}

// Unified horizontal line loader - moves from bottom to top of screen
const HorizontalLineLoader = ({ 
  size = 'md', 
  progress 
}: { 
  size?: 'sm' | 'md' | 'lg'
  progress?: number 
}) => {
  // Use system preference for dark mode detection
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  
  const lineHeight = size === 'sm' ? 'h-0.5' : size === 'lg' ? 'h-1' : 'h-0.5'
  
  // If progress is provided, use it for positioning
  const linePosition = progress !== undefined 
    ? `${100 - progress}%` // 0% progress = bottom (100% from top), 100% progress = top (0% from top)
    : undefined
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        className={`absolute left-0 right-0 ${lineHeight} ${
          isDark ? 'bg-white' : 'bg-black'
        }`}
        style={{
          bottom: progress !== undefined ? linePosition : '0',
          transition: progress !== undefined ? 'bottom 0.3s ease-out' : 'none',
          animation: progress === undefined ? 'line-sweep 2s ease-in-out infinite' : 'none'
        }}
      />
    </div>
  )
}

export function Loader({ 
  size = 'md', 
  showText = false, 
  text,
  className = '',
  progress
}: LoaderProps) {
  const { t } = useTranslation()
  
  const displayText = text || t('common.loading')
  
  return (
    <div className={className}>
      <HorizontalLineLoader size={size} progress={progress} />
      {showText && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">
            {displayText}
          </span>
        </div>
      )}
    </div>
  )
}

// Full screen loader component
export function FullScreenLoader({ 
  text,
  progress
}: { 
  text?: string 
  progress?: number
}) {
  const { t } = useTranslation()
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <HorizontalLineLoader size="lg" progress={progress} />
      {text && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <span className="text-base text-muted-foreground bg-background/90 px-4 py-2 rounded">
            {text}
          </span>
        </div>
      )}
    </div>
  )
} 