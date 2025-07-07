'use client'

import { useEffect, useState } from 'react'
import { getPerformanceMetrics, isLowPerformanceMode } from '@/lib/utils'

interface PerformanceData {
  frameCount: number
  averageFPS: number
  lowPerformanceMode: boolean
}

export function PerformanceMonitor() {
  const [performance, setPerformance] = useState<PerformanceData>({
    frameCount: 0,
    averageFPS: 60,
    lowPerformanceMode: false
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    // Toggle with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Update performance metrics every 500ms
    const interval = setInterval(() => {
      const metrics = getPerformanceMetrics()
      setPerformance({
        frameCount: metrics.frameCount,
        averageFPS: Math.round(metrics.averageFPS),
        lowPerformanceMode: metrics.lowPerformanceMode
      })
    }, 500)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible || process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-3 rounded-lg font-mono text-sm z-50 backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>FPS:</span>
          <span className={performance.averageFPS < 30 ? 'text-red-400' : performance.averageFPS < 50 ? 'text-yellow-400' : 'text-green-400'}>
            {performance.averageFPS}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Frames:</span>
          <span>{performance.frameCount}</span>
        </div>
        {performance.lowPerformanceMode && (
          <div className="text-red-400 text-xs">Low Performance Mode</div>
        )}
        <div className="text-xs text-gray-400 mt-2">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  )
} 