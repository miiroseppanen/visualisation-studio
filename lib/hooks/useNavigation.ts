import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

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
    router.push(path)
  }, [router])

  const navigateBack = useCallback((fallbackPath: string = '/') => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }, [router])

  const navigateHome = useCallback(() => {
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