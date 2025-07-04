import { useState, useEffect, useMemo } from 'react'

interface MobileDetectionResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  // Breakpoints
  isXs: boolean  // < 640px
  isSm: boolean  // >= 640px
  isMd: boolean  // >= 768px
  isLg: boolean  // >= 1024px
  isXl: boolean  // >= 1280px
}

export function useMobileDetection(): MobileDetectionResult {
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Detect touch capability
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      )
    }

    checkTouchDevice()

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Memoized calculations
  const result = useMemo((): MobileDetectionResult => {
    const width = windowSize.width
    const height = windowSize.height

    // Breakpoints (matching Tailwind CSS)
    const isXs = width < 640
    const isSm = width >= 640 && width < 768
    const isMd = width >= 768 && width < 1024
    const isLg = width >= 1024 && width < 1280
    const isXl = width >= 1280

    // Device type detection
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024

    // Orientation
    const orientation = width > height ? 'landscape' : 'portrait'

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
      orientation,
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
    }
  }, [windowSize.width, windowSize.height, isTouchDevice])

  return result
}

// Utility function for responsive values
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  default: T
}): T {
  const { isXs, isSm, isMd, isLg, isXl } = useMobileDetection()

  return useMemo(() => {
    if (isXl && values.xl !== undefined) return values.xl
    if (isLg && values.lg !== undefined) return values.lg
    if (isMd && values.md !== undefined) return values.md
    if (isSm && values.sm !== undefined) return values.sm
    if (isXs && values.xs !== undefined) return values.xs
    return values.default
  }, [isXs, isSm, isMd, isLg, isXl, values])
} 