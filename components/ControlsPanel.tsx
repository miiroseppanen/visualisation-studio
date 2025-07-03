"use client"

import React, { useState } from "react"
import { Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlsPanelProps {
  children: React.ReactNode
  title?: string
}

export default function ControlsPanel({ children, title = "Controls" }: ControlsPanelProps) {
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          "fixed top-24 right-4 bottom-4 z-50 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "relative h-full w-80 max-w-[90vw] rounded-md border border-border/20 transition-all duration-300 flex flex-col pointer-events-auto",
            "shadow-lg hover:shadow-2xl",
            "bg-background/15 hover:bg-background/95 backdrop-blur-sm hover:backdrop-blur-md",
            open ? "translate-x-0" : "translate-x-full",
            "overflow-hidden"
          )}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-border/20 bg-background/20 hover:bg-background/90 backdrop-blur-xs hover:backdrop-blur-md transition-all duration-300">
            {open && <h2 className="text-lg font-normal">{title}</h2>}
            <div className="ml-auto w-8 h-8"></div> {/* Spacer for button */}
          </div>
          
          {/* Content */}
          {open && (
            <div className="flex-1 overflow-y-auto p-6 pb-20 bg-background/10 hover:bg-background/80 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Button - Always visible, positioned outside the panel */}
      <div className="fixed top-28 right-8 z-[60] pointer-events-auto">
        <button
          className="bg-background/20 hover:bg-background/90 backdrop-blur-xs hover:backdrop-blur-md border border-border/20 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close controls" : "Open controls"}
          tabIndex={0}
        >
          {open ? (
            <X className="w-4 h-4" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  )
} 