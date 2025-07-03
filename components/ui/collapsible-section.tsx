import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VISUALIZATION_STYLES, buildClasses } from '@/lib/visualization-styles'

interface CollapsibleSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}

export function CollapsibleSection({ 
  title, 
  expanded, 
  onToggle, 
  children, 
  className 
}: CollapsibleSectionProps) {
  return (
    <div className={cn(VISUALIZATION_STYLES.collapsible.container, className)}>
      <button
        className={VISUALIZATION_STYLES.collapsible.button}
        onClick={onToggle}
      >
        <div className={VISUALIZATION_STYLES.collapsible.chevron}>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {title}
      </button>

      <div className={buildClasses.collapsibleContent(expanded)}>
        <div className={buildClasses.collapsibleInner(expanded)}>
          {children}
        </div>
      </div>
    </div>
  )
} 