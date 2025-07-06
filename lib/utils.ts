import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global animation pause utility
let globalAnimationFrames: number[] = []

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

// Memory management utilities
export function createAnimationLoop(
  callback: () => void,
  isActive: boolean,
  dependencies: any[] = []
): () => void {
  let frameId: number | null = null
  
  if (isActive) {
    const animate = () => {
      callback()
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