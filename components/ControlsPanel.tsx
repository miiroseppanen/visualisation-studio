"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
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
            "relative h-full w-80 max-w-[90vw] rounded-md shadow-xl border border-border/20 bg-background/30 backdrop-blur-sm transition-transform duration-300 flex flex-col pointer-events-auto",
            open ? "translate-x-0" : "translate-x-full",
            "hover:shadow-2xl overflow-hidden"
          )}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-border/20 bg-background/40 backdrop-blur-xs">
            {open && <h2 className="text-lg font-normal">{title}</h2>}
            <div className="ml-auto w-8 h-8"></div> {/* Spacer for button */}
          </div>
          
          {/* Content */}
          {open && (
            <div className="flex-1 overflow-y-auto p-6 pb-20 bg-background/30 backdrop-blur-sm">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Button - Always visible, positioned outside the panel */}
      <div className="fixed top-28 right-8 z-[60] pointer-events-auto">
        <button
          className="bg-background/40 backdrop-blur-xs border border-border/20 rounded-full p-3 hover:bg-background/60 transition-colors shadow-lg"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Minimize controls" : "Show controls"}
          tabIndex={0}
        >
          {open ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  )
} 