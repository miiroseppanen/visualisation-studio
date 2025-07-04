"use client"

import React from "react"
import { Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VISUALIZATION_STYLES, buildClasses } from "@/lib/visualization-styles"

interface ControlsPanelProps {
  children: React.ReactNode
  title?: string
  isOpen?: boolean
  onToggle?: () => void
}

export default function ControlsPanel({ 
  children, 
  title = "Controls", 
  isOpen = true, 
  onToggle 
}: ControlsPanelProps) {
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    }
  }

  return (
    <>
      {/* Panel */}
      <div className={VISUALIZATION_STYLES.settingsPanel.container}>
        <div className={buildClasses.settingsPanel(isOpen)}>
          {/* Top Bar */}
          <div className={VISUALIZATION_STYLES.settingsPanel.topBar}>
            <div className={cn(
              "transition-all duration-500 ease-in-out",
              isOpen ? VISUALIZATION_STYLES.animations.titleSlideIn : VISUALIZATION_STYLES.animations.titleSlideOut
            )}>
              <h2 className={VISUALIZATION_STYLES.typography.title}>{title}</h2>
            </div>
            <div className="ml-auto w-8 h-8"></div> {/* Spacer for button */}
          </div>
          
          {/* Content */}
          <div className={cn(
            VISUALIZATION_STYLES.settingsPanel.content,
            "transition-all duration-500 ease-in-out delay-100",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            <div className={VISUALIZATION_STYLES.settingsPanel.contentInner}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Button - Always visible, positioned outside the panel */}
      <div className={VISUALIZATION_STYLES.settingsPanel.buttonContainer}>
        <button
          className={VISUALIZATION_STYLES.settingsPanel.button}
          onClick={handleToggle}
          aria-label={isOpen ? "Close controls" : "Open controls"}
          tabIndex={0}
        >
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isOpen ? "rotate-180" : "rotate-0"
          )}>
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>
    </>
  )
} 