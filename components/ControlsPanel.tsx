"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileUI } from "@/lib/hooks/useMobileUI"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  const [panelState, setPanelState] = useState<PanelState>(isOpen ? 'open' : 'closed')
  const { isUIVisible, isMobile } = useMobileUI()

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

      {/* Toggle Button - Always visible when panel is closed, respects mobile UI visibility */}
      {!isPanelVisible && (
        <div className={cn(
          // Mobile: Bottom right corner
          "fixed bottom-4 right-4 z-[60] pointer-events-auto transition-all duration-300 ease-in-out",
          // Desktop: Top right with margin - moved lower and closer to edge
          "md:fixed md:top-32 md:right-6 md:bottom-auto md:z-50",
          // Mobile UI visibility
          isMobile && !isUIVisible ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <button
            onClick={handleToggle}
            className={cn(
              "bg-white/60 hover:bg-white/80 border border-gray-300/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 transform-gpu text-gray-800 group touch-manipulation backdrop-blur-md dark:bg-black/60 dark:border-white/20 dark:text-white dark:hover:bg-black/80",
              // Mobile: Larger touch target
              "p-4 md:p-3"
            )}
            aria-label={t('visualizationSettings.openControls')}
            title={`${t('visualizationSettings.openControls')} ${title}`}
          >
            <Settings className="w-5 h-5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Main Panel Container */}
      <div 
        className={cn(
          // Mobile: Full height bottom sheet
          "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-in-out pointer-events-none",
          isPanelVisible ? "translate-y-0" : "translate-y-full",
          // Desktop: Side panel on right with margin
          "md:fixed md:top-20 md:right-4 md:left-auto md:bottom-4 md:w-80 md:translate-y-0 md:z-40 md:pointer-events-auto",
          // Desktop transforms
          isPanelVisible ? "md:translate-x-0 md:pointer-events-auto" : "md:translate-x-full md:pointer-events-none"
        )}
      >
        {/* Panel Content */}
        <div className={cn(
          // Mobile: Bottom sheet style
          "relative h-[85vh] w-full bg-white/60 backdrop-blur-md border border-gray-200/40 shadow-2xl flex flex-col rounded-lg hover:bg-white/80 transition-all duration-300 dark:bg-black/60 dark:border-white/20 dark:hover:bg-black/80 mt-6 pointer-events-auto",
          // Desktop: Side panel style with glass effect
          "md:h-full md:w-80 md:bg-white/60 md:backdrop-blur-md md:border md:border-gray-200/40 md:shadow-2xl md:rounded-lg md:hover:bg-white/80 md:dark:bg-black/60 md:dark:border-white/20 md:dark:hover:bg-black/80 md:mt-8 md:pointer-events-auto"
        )}>
          
          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/40 backdrop-blur-sm rounded-t-lg dark:border-white/20 dark:bg-black/40">
            {/* Mobile drag handle */}
            <div className="md:hidden w-full flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full dark:bg-white/60"></div>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-normal text-gray-800 dark:text-white">{title || t('visualizationSettings.controls')}</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-gray-100/50 transition-colors group touch-manipulation dark:hover:bg-white/10"
                aria-label={t('visualizationSettings.closePanel')}
                title={t('visualizationSettings.closeEsc')}
              >
                <X className="w-5 h-5 md:w-4 md:h-4 text-gray-600 group-hover:text-gray-800 dark:text-white/80 dark:group-hover:text-white" />
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
    </>
  )
} 