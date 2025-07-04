import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { pauseAllAnimations } from '../utils'

interface NavigationActions {
  navigateToPath: (path: string) => void
  navigateBack: (fallbackPath?: string) => void
  navigateHome: () => void
  isCurrentPath: (path: string) => boolean
}

/**
 * Simple navigation hook focused purely on navigation actions
 * Separate from visualization-specific logic
 */
export function useNavigation(): NavigationActions {
  const router = useRouter()
  const pathname = usePathname()

  const navigateToPath = useCallback((path: string) => {
    // Pause all animations before navigating to prevent interference
    pauseAllAnimations()
    router.push(path)
  }, [router])

  const navigateBack = useCallback((fallbackPath: string = '/') => {
    // Pause all animations before navigating to prevent interference
    pauseAllAnimations()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }, [router])

  const navigateHome = useCallback(() => {
    // Pause all animations before navigating to prevent interference
    pauseAllAnimations()
    router.push('/')
  }, [router])

  const isCurrentPath = useCallback((path: string) => {
    return pathname === path
  }, [pathname])

  return {
    navigateToPath,
    navigateBack,
    navigateHome,
    isCurrentPath,
  }
} 