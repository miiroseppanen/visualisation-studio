'use client'

import React from 'react'
import { RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationActionButtonsProps {
  onReset?: () => void
  onExportSVG?: () => void
  additionalButtons?: React.ReactNode
  className?: string
}

export default function NavigationActionButtons({
  onReset,
  onExportSVG,
  additionalButtons,
  className = ''
}: NavigationActionButtonsProps) {
  return (
    <div className={`flex items-center space-x-1 sm:space-x-2 ${className}`}>
      {onReset && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="min-w-0 px-2 sm:px-3 py-2 touch-manipulation"
          aria-label="Reset visualization"
        >
          <RotateCcw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      )}
      {onExportSVG && (
        <Button 
          size="sm" 
          onClick={onExportSVG}
          className="min-w-0 px-2 sm:px-3 py-2 touch-manipulation"
          aria-label="Export as SVG"
        >
          <Download className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">SVG</span>
        </Button>
      )}
      {additionalButtons}
    </div>
  )
} 