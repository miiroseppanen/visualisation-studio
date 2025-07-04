import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleHeaderProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function CollapsibleHeader({
  title,
  isExpanded,
  onToggle,
  className
}: CollapsibleHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors",
        className
      )}
    >
      {isExpanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      {title}
    </button>
  )
} 