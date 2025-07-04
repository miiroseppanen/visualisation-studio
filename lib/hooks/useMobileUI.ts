'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMobileDetection } from './useMobileDetection'

interface MobileUIState {
  isUIVisible: boolean
  showUI: () => void
  hideUI: () => void
  toggleUI: () => void
  isMobile: boolean
}

export function useMobileUI(): MobileUIState {
  const [isUIVisible, setIsUIVisible] = useState(true)
  const { isMobile } = useMobileDetection()

  const showUI = useCallback(() => {
    setIsUIVisible(true)
  }, [])

  const hideUI = useCallback(() => {
    if (isMobile) {
      setIsUIVisible(false)
    }
  }, [isMobile])

  const toggleUI = useCallback(() => {
    if (isMobile) {
      setIsUIVisible(prev => !prev)
      // Add haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }, [isMobile])

  // Auto-hide UI after inactivity on mobile
  useEffect(() => {
    if (!isMobile) return

    let timeoutId: NodeJS.Timeout
    let touchStartTime = 0
    let touchStartY = 0

    const resetTimer = () => {
      clearTimeout(timeoutId)
      if (isUIVisible) {
        timeoutId = setTimeout(() => {
          hideUI()
        }, 4000) // Hide after 4 seconds of inactivity
      }
    }

    const handleUserActivity = () => {
      if (!isUIVisible) {
        showUI()
      }
      resetTimer()
    }

    // Enhanced touch handling to prevent accidental UI hiding
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now()
      touchStartY = e.touches[0].clientY
      
      // Don't show UI immediately on touch start to prevent flickering
      if (!isUIVisible) {
        // Only show UI if it's a tap (not a scroll)
        setTimeout(() => {
          if (Date.now() - touchStartTime < 200) {
            showUI()
          }
        }, 100)
      }
      resetTimer()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndTime = Date.now()
      const touchDuration = touchEndTime - touchStartTime
      const touchEndY = e.changedTouches[0].clientY
      const touchDistance = Math.abs(touchEndY - touchStartY)

      // Only toggle UI if it's a short tap with minimal movement
      if (touchDuration < 300 && touchDistance < 10) {
        // Check if the touch was on the canvas area (not on UI elements)
        const target = e.target as Element
        if (target && target.closest('.canvas-container')) {
          toggleUI()
        }
      }
    }

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, isUIVisible, showUI, hideUI, toggleUI])

  return {
    isUIVisible: isMobile ? isUIVisible : true,
    showUI,
    hideUI,
    toggleUI,
    isMobile
  }
} 