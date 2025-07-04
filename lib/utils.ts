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