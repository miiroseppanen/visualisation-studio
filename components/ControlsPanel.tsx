"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlsPanelProps {
  children: React.ReactNode
  title?: string
  isOpen?: boolean
  onToggle?: () => void
}

type PanelState = 'open' | 'closed'

export default function ControlsPanel({ 
  children, 
  title = "Controls", 
  isOpen = true, 
  onToggle 
}: ControlsPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>(isOpen ? 'open' : 'closed')

  // Sync with external state
  useEffect(() => {
    setPanelState(isOpen ? 'open' : 'closed')
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState === 'open') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [panelState])

  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle()
    } else {
      setPanelState(prev => prev === 'open' ? 'closed' : 'open')
    }
  }, [onToggle])

  const handleClose = useCallback(() => {
    setPanelState('closed')
    if (onToggle) {
      onToggle()
    }
  }, [onToggle])

  const isPanelVisible = panelState === 'open'

  return (
    <>
      {/* Backdrop for mobile */}
      {isPanelVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Main Panel Container */}
      <div 
        className={cn(
          // Mobile: Full height bottom sheet
          "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-in-out",
          isPanelVisible ? "translate-y-0" : "translate-y-full",
          // Desktop: Side panel on right 
          "md:fixed md:top-16 md:right-0 md:left-auto md:bottom-0 md:w-80 md:translate-y-0 md:z-40",
          // Desktop transforms
          isPanelVisible ? "md:translate-x-0" : "md:translate-x-full"
        )}
      >
        {/* Panel Content */}
        <div className={cn(
          // Mobile: Bottom sheet style
          "relative h-[85vh] w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl flex flex-col rounded-t-xl",
          // Desktop: Side panel style
          "md:h-full md:w-80 md:bg-white/95 md:backdrop-blur-md md:border-l md:border-t-0 md:shadow-2xl md:rounded-t-none md:rounded-none"
        )}>
          
          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            {/* Mobile drag handle */}
            <div className="md:hidden w-full flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-normal text-gray-800">{title}</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group touch-manipulation"
                aria-label="Close panel"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 md:w-4 md:h-4 text-gray-600 group-hover:text-gray-800" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Always visible when panel is closed */}
      {!isPanelVisible && (
        <div className={cn(
          // Mobile: Bottom right corner
          "fixed bottom-4 right-4 z-[60] pointer-events-auto",
          // Desktop: Top right 
          "md:fixed md:top-20 md:right-4 md:bottom-auto md:z-50"
        )}>
          <button
            onClick={handleToggle}
            className={cn(
              "bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 transform-gpu text-gray-800 group touch-manipulation",
              // Mobile: Larger touch target
              "p-4 md:p-3"
            )}
            aria-label="Open controls"
            title={`Open ${title}`}
          >
            <Settings className="w-5 h-5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}
    </>
  )
} 