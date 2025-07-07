"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Settings, X, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileUI } from "@/lib/hooks/useMobileUI"
import { useTranslation } from "react-i18next"

interface EnhancedControlsPanelProps {
  children: React.ReactNode
  title?: string
  isOpen?: boolean
  onToggle?: () => void
  autoHideDelay?: number // Time in milliseconds before auto-hiding on mobile
  showMinimizeButton?: boolean
  onMinimize?: () => void
  isMinimized?: boolean
}

type PanelState = 'open' | 'closed' | 'minimized'

export default function EnhancedControlsPanel({ 
  children, 
  title = "Controls", 
  isOpen = true, 
  onToggle,
  autoHideDelay = 4000, // 4 seconds default
  showMinimizeButton = true,
  onMinimize,
  isMinimized = false
}: EnhancedControlsPanelProps) {
  const { t } = useTranslation()
  const [panelState, setPanelState] = useState<PanelState>(isOpen ? 'open' : 'closed')
  const { isUIVisible, isMobile, showUI } = useMobileUI()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [currentTranslateY, setCurrentTranslateY] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const autoHideTimeoutRef = useRef<NodeJS.Timeout>()

  // Sync with external state
  useEffect(() => {
    if (isMinimized) {
      setPanelState('minimized')
    } else {
      setPanelState(isOpen ? 'open' : 'closed')
    }
  }, [isOpen, isMinimized])

  // Auto-hide functionality for mobile
  useEffect(() => {
    if (!isMobile || panelState !== 'open') return

    const resetAutoHideTimer = () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
      }
      
      autoHideTimeoutRef.current = setTimeout(() => {
        if (panelState === 'open') {
          handleClose()
        }
      }, autoHideDelay)
    }

    const handleUserActivity = () => {
      resetAutoHideTimer()
    }

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    resetAutoHideTimer()

    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [isMobile, panelState, autoHideDelay])

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

  const handleMinimize = useCallback(() => {
    if (onMinimize) {
      onMinimize()
    } else {
      setPanelState('minimized')
    }
  }, [onMinimize])

  const handleMaximize = useCallback(() => {
    if (onMinimize) {
      onMinimize()
    } else {
      setPanelState('open')
    }
  }, [onMinimize])

  // Touch drag handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
    setCurrentTranslateY(0)
  }, [isMobile])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return
    e.preventDefault()
    
    const currentY = e.touches[0].clientY
    const deltaY = currentY - dragStartY
    
    if (deltaY > 0) { // Only allow downward dragging
      setCurrentTranslateY(deltaY)
    }
  }, [isDragging, isMobile, dragStartY])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !isMobile) return
    setIsDragging(false)
    
    // If dragged down more than 100px, close the panel
    if (currentTranslateY > 100) {
      handleClose()
    } else {
      setCurrentTranslateY(0)
    }
  }, [isDragging, isMobile, currentTranslateY, handleClose])

  const isPanelVisible = panelState === 'open'
  const isPanelMinimized = panelState === 'minimized'

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
      {!isPanelVisible && !isPanelMinimized && (
        <div className={cn(
          // Mobile: Bottom right corner
          "fixed bottom-4 right-4 z-[60] pointer-events-auto transition-all duration-300 ease-in-out",
          // Desktop: Top right with margin
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

      {/* Minimized Panel */}
      {isPanelMinimized && (
        <div className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          // Mobile: Bottom right corner
          "bottom-4 right-4 md:top-32 md:right-6 md:bottom-auto"
        )}>
          <div className="bg-white/60 backdrop-blur-md border border-gray-200/40 shadow-lg rounded-lg p-3 dark:bg-black/60 dark:border-white/20">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-600 dark:text-white/80" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">{title}</span>
              <button
                onClick={handleMaximize}
                className="p-1 rounded hover:bg-gray-100/50 transition-colors dark:hover:bg-white/10"
                aria-label="Maximize panel"
              >
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-white/80" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Container */}
      <div 
        ref={panelRef}
        className={cn(
          // Mobile: Full height bottom sheet with drag support
          "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-in-out pointer-events-none",
          isPanelVisible ? "translate-y-0" : "translate-y-full",
          // Desktop: Side panel on right with margin
          "md:fixed md:top-20 md:right-4 md:left-auto md:bottom-4 md:w-80 md:translate-y-0 md:z-40 md:pointer-events-auto",
          // Desktop transforms
          isPanelVisible ? "md:translate-x-0 md:pointer-events-auto" : "md:translate-x-full md:pointer-events-none",
          // Drag transform
          isDragging && `transform translate-y-[${currentTranslateY}px]`
        )}
        style={{
          transform: isDragging ? `translateY(${currentTranslateY}px)` : undefined
        }}
      >
        {/* Panel Content */}
        <div 
          className={cn(
            // Mobile: Bottom sheet style with drag handle
            "relative h-[85vh] w-full bg-white/60 backdrop-blur-md border border-gray-200/40 shadow-2xl flex flex-col rounded-lg hover:bg-white/80 transition-all duration-300 dark:bg-black/60 dark:border-white/20 dark:hover:bg-black/80 mt-6 pointer-events-auto",
            // Desktop: Side panel style with glass effect
            "md:h-full md:w-80 md:bg-white/60 md:backdrop-blur-md md:border md:border-gray-200/40 md:shadow-2xl md:rounded-lg md:hover:bg-white/80 md:dark:bg-black/60 md:dark:border-white/20 md:dark:hover:bg-black/80 md:mt-8 md:pointer-events-auto"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/40 backdrop-blur-sm rounded-t-lg dark:border-white/20 dark:bg-black/40">
            {/* Mobile drag handle */}
            <div className="md:hidden w-full flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full dark:bg-white/60"></div>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-normal text-gray-800 dark:text-white">{title || t('navigation.settings')}</h2>
              <div className="flex items-center space-x-1">
                {showMinimizeButton && (
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 rounded-md hover:bg-gray-100/50 transition-colors group touch-manipulation dark:hover:bg-white/10"
                    aria-label="Minimize panel"
                    title="Minimize panel"
                  >
                    <ChevronDown className="w-5 h-5 md:w-4 md:h-4 text-gray-600 group-hover:text-gray-800 dark:text-white/80 dark:group-hover:text-white" />
                  </button>
                )}
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
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 md:p-6">
              {children}
            </div>
          </div>

          {/* Auto-hide indicator for mobile */}
          {isMobile && isPanelVisible && (
            <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-1 bg-gray-300/50 rounded-full dark:bg-white/30"></div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 