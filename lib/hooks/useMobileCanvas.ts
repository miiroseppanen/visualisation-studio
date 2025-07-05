'use client'

import { useEffect, useCallback } from 'react'
import { useMobileDetection } from './useMobileDetection'

interface MobileCanvasOptions {
  maxDPI?: number
  enablePerformanceMode?: boolean
  enableAutoResize?: boolean
}

export function useMobileCanvas(
  canvasRef: { current: HTMLCanvasElement | null },
  options: MobileCanvasOptions = {}
) {
  const { isMobile, screenWidth, screenHeight } = useMobileDetection()
  
  const {
    maxDPI = 1.5,
    enablePerformanceMode = true,
    enableAutoResize = true
  } = options

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Calculate optimal DPI for mobile
    let dpr = window.devicePixelRatio
    if (isMobile && enablePerformanceMode) {
      // Limit DPI on mobile for better performance
      dpr = Math.min(dpr, maxDPI)
      
      // Further reduce DPI on very small screens
      if (screenWidth < 380) {
        dpr = Math.min(dpr, 1.25)
      }
    }

    // Set canvas dimensions
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Scale context
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      
      // Apply mobile-specific optimizations
      if (isMobile && enablePerformanceMode) {
        // Optimize for mobile performance
        ctx.imageSmoothingEnabled = false
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    return { width, height, dpr }
  }, [canvasRef, isMobile, enablePerformanceMode, maxDPI, screenWidth])

  const resizeCanvas = useCallback(() => {
    return setupCanvas()
  }, [setupCanvas])

  // Auto-resize on window resize
  useEffect(() => {
    if (!enableAutoResize) return

    const handleResize = () => {
      resizeCanvas()
    }

    setupCanvas() // Initial setup
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [setupCanvas, resizeCanvas, enableAutoResize])

  return {
    setupCanvas,
    resizeCanvas,
    isMobile,
    screenWidth,
    screenHeight,
    // Utility methods
    getCanvasSize: () => {
      const canvas = canvasRef.current
      if (!canvas) return { width: 0, height: 0 }
      return {
        width: canvas.width,
        height: canvas.height,
        displayWidth: canvas.clientWidth,
        displayHeight: canvas.clientHeight
      }
    },
    getCanvasCoordinates: (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    }
  }
}