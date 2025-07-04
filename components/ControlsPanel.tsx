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
      {/* Main Panel Container */}
      <div 
        className={cn(
          "fixed top-20 right-0 bottom-4 z-50 transition-all duration-500 ease-in-out",
          isPanelVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel Content */}
        <div className="relative h-full w-80 bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-2xl flex flex-col">
          
          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <h2 className="text-lg font-normal text-gray-800">{title}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group"
                aria-label="Close panel"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Always visible when panel is closed */}
      {!isPanelVisible && (
        <div className="fixed top-20 right-4 z-[60] pointer-events-auto">
          <button
            onClick={handleToggle}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 transform-gpu text-gray-800 group"
            aria-label="Open controls"
            title={`Open ${title}`}
          >
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}
    </>
  )
} 