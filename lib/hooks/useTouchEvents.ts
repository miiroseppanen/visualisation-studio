'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useMobileDetection } from './useMobileDetection'

interface TouchEventHandlers {
  onTouchStart?: (x: number, y: number, event: TouchEvent) => void
  onTouchMove?: (x: number, y: number, event: TouchEvent) => void
  onTouchEnd?: (x: number, y: number, event: TouchEvent) => void
  onTouchCancel?: (event: TouchEvent) => void
  onPinchZoom?: (scale: number, centerX: number, centerY: number) => void
  onLongPress?: (x: number, y: number) => void
}

interface UseTouchEventsOptions {
  enablePinchZoom?: boolean
  enableLongPress?: boolean
  longPressDelay?: number
  preventScroll?: boolean
}

interface TouchEventData {
  x: number
  y: number
  timestamp: number
  identifier: number
}

export function useTouchEvents(
  canvasRef: { current: HTMLCanvasElement | null },
  handlers: TouchEventHandlers,
  options: UseTouchEventsOptions = {}
) {
  const { isMobile } = useMobileDetection()
  const touchesRef = useRef<TouchEventData[]>([])
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const initialDistanceRef = useRef<number>(0)
  const initialScaleRef = useRef<number>(1)
  const lastTouchTimeRef = useRef<number>(0)

  const {
    enablePinchZoom = true,
    enableLongPress = true,
    longPressDelay = 500,
    preventScroll = true
  } = options

  // Get canvas coordinates from touch event
  const getTouchCoordinates = useCallback((touch: Touch) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    }
  }, [canvasRef])

  // Calculate distance between two touches
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Get center point between two touches
  const getTouchCenter = useCallback((touch1: Touch, touch2: Touch) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2

    return {
      x: (centerX - rect.left) * scaleX,
      y: (centerY - rect.top) * scaleY
    }
  }, [canvasRef])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile) return

    if (preventScroll) {
      e.preventDefault()
    }

    const now = Date.now()
    lastTouchTimeRef.current = now

    // Update touches
    const newTouches: TouchEventData[] = []
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i]
      const coords = getTouchCoordinates(touch)
      newTouches.push({
        x: coords.x,
        y: coords.y,
        timestamp: now,
        identifier: touch.identifier
      })
    }
    touchesRef.current = newTouches

    // Handle single touch
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const coords = getTouchCoordinates(touch)
      
      // Start long press timer
      if (enableLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          handlers.onLongPress?.(coords.x, coords.y)
        }, longPressDelay)
      }

      handlers.onTouchStart?.(coords.x, coords.y, e)
    }

    // Handle multi-touch for pinch zoom
    if (e.touches.length === 2 && enablePinchZoom) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistanceRef.current = getTouchDistance(touch1, touch2)
      initialScaleRef.current = 1

      // Clear long press timer on multi-touch
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [isMobile, preventScroll, enableLongPress, enablePinchZoom, longPressDelay, handlers, getTouchCoordinates, getTouchDistance])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobile) return

    if (preventScroll) {
      e.preventDefault()
    }

    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    // Handle single touch move
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const coords = getTouchCoordinates(touch)
      handlers.onTouchMove?.(coords.x, coords.y, e)
    }

    // Handle pinch zoom
    if (e.touches.length === 2 && enablePinchZoom) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = getTouchDistance(touch1, touch2)
      const center = getTouchCenter(touch1, touch2)

      if (initialDistanceRef.current > 0) {
        const scale = currentDistance / initialDistanceRef.current
        handlers.onPinchZoom?.(scale, center.x, center.y)
      }
    }
  }, [isMobile, preventScroll, enablePinchZoom, handlers, getTouchCoordinates, getTouchDistance, getTouchCenter])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isMobile) return

    if (preventScroll) {
      e.preventDefault()
    }

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    // Handle single touch end
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0]
      const coords = getTouchCoordinates(touch)
      handlers.onTouchEnd?.(coords.x, coords.y, e)
    }

    // Reset touch state
    if (e.touches.length === 0) {
      touchesRef.current = []
      initialDistanceRef.current = 0
      initialScaleRef.current = 1
    }
  }, [isMobile, preventScroll, handlers, getTouchCoordinates])

  // Handle touch cancel
  const handleTouchCancel = useCallback((e: TouchEvent) => {
    if (!isMobile) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    // Reset touch state
    touchesRef.current = []
    initialDistanceRef.current = 0
    initialScaleRef.current = 1

    handlers.onTouchCancel?.(e)
  }, [isMobile, handlers])

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isMobile) return

    const options: AddEventListenerOptions = {
      passive: !preventScroll,
      capture: false
    }

    canvas.addEventListener('touchstart', handleTouchStart, options)
    canvas.addEventListener('touchmove', handleTouchMove, options)
    canvas.addEventListener('touchend', handleTouchEnd, options)
    canvas.addEventListener('touchcancel', handleTouchCancel, options)

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [isMobile, preventScroll, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return {
    isMobile,
    touchCount: touchesRef.current.length,
    lastTouchTime: lastTouchTimeRef.current
  }
}