import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global animation pause utility
let globalAnimationFrames: number[] = []
let performanceMetrics = {
  frameCount: 0,
  lastFrameTime: 0,
  averageFPS: 60,
  lowPerformanceMode: false
}

export function registerAnimationFrame(id: number) {
  globalAnimationFrames.push(id)
}

export function unregisterAnimationFrame(id: number) {
  globalAnimationFrames = globalAnimationFrames.filter(frameId => frameId !== id)
}

export function pauseAllAnimations() {
  // Cancel all registered animation frames
  globalAnimationFrames.forEach(id => {
    cancelAnimationFrame(id)
  })
  globalAnimationFrames = []
  
  // Dispatch a custom event to notify all components to pause their animations
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pauseAllAnimations'))
  }
}

// Performance monitoring
export function updatePerformanceMetrics() {
  const now = performance.now()
  const delta = now - performanceMetrics.lastFrameTime
  
  if (delta > 0) {
    const currentFPS = 1000 / delta
    performanceMetrics.averageFPS = performanceMetrics.averageFPS * 0.9 + currentFPS * 0.1
    
    // Enable low performance mode if FPS drops below 30
    if (performanceMetrics.averageFPS < 30 && !performanceMetrics.lowPerformanceMode) {
      performanceMetrics.lowPerformanceMode = true
    } else if (performanceMetrics.averageFPS > 50 && performanceMetrics.lowPerformanceMode) {
      performanceMetrics.lowPerformanceMode = false
    }
  }
  
  performanceMetrics.lastFrameTime = now
  performanceMetrics.frameCount++
}

export function getPerformanceMetrics() {
  return { ...performanceMetrics }
}

export function isLowPerformanceMode() {
  return performanceMetrics.lowPerformanceMode
}

// Memory management utilities
export function createAnimationLoop(
  callback: () => void,
  isActive: boolean,
  dependencies: any[] = []
): () => void {
  let frameId: number | null = null
  let lastFrameTime = 0
  const targetFPS = 60
  const frameInterval = 1000 / targetFPS
  
  if (isActive) {
    const animate = (currentTime: number) => {
      // Throttle frames for better performance
      if (currentTime - lastFrameTime >= frameInterval) {
        callback()
        updatePerformanceMetrics()
        lastFrameTime = currentTime
      }
      
      frameId = requestAnimationFrame(animate)
      registerAnimationFrame(frameId)
    }
    frameId = requestAnimationFrame(animate)
    registerAnimationFrame(frameId)
  }
  
  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
      unregisterAnimationFrame(frameId)
    }
  }
}

// Optimized array operations to reduce memory pressure
export function updateArrayInPlace<T>(
  array: T[],
  updater: (item: T, index: number) => T
): T[] {
  for (let i = 0; i < array.length; i++) {
    array[i] = updater(array[i], i)
  }
  return array
}

export function updateTrailEfficiently<T extends { opacity?: number; life?: number }>(
  trail: T[],
  newPoint: T,
  maxLength: number,
  fadeFactor: number = 0.95
): T[] {
  const newTrail = trail.slice() // Shallow copy
  newTrail.push(newPoint)
  
  // Remove old points if exceeding max length
  if (newTrail.length > maxLength) {
    newTrail.splice(0, newTrail.length - maxLength)
  }
  
  // Fade existing points in place
  for (let i = 0; i < newTrail.length; i++) {
    const point = newTrail[i]
    if ('opacity' in point && typeof point.opacity === 'number') {
      point.opacity *= fadeFactor
    }
    if ('life' in point && typeof point.life === 'number') {
      point.life *= fadeFactor
    }
  }
  
  return newTrail
}

// Debounced resize handler to prevent excessive canvas resizing
export function createDebouncedResizeHandler(
  callback: () => void,
  delay: number = 100
): () => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(callback, delay)
  }
}

// Cleanup utility for component unmounting
export function createCleanupManager() {
  const cleanupFunctions: (() => void)[] = []
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup)
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn())
      cleanupFunctions.length = 0
    }
  }
}

// Canvas optimization utilities
export function optimizeCanvasForPerformance(canvas: HTMLCanvasElement, isMobile: boolean = false) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Reduce quality on mobile for better performance
  if (isMobile) {
    ctx.imageSmoothingEnabled = false
    ctx.globalCompositeOperation = 'source-over'
  }
  
  // Use lower DPI on mobile
  const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio
  return dpr
}

// Throttled function utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func(...args)
    cache.set(key, result)
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      if (firstKey) {
        cache.delete(firstKey)
      }
    }
    
    return result
  }) as T
} 