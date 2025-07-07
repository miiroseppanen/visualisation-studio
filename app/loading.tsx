'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/ui/ThemeProvider'

// Cool animated dots component
const AnimatedDots = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            isDark ? 'bg-white' : 'bg-black'
          } animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  )
}

// Geometric loader component
const GeometricLoader = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  return (
    <div className="relative w-12 h-12">
      {/* Rotating square */}
      <div 
        className={`absolute inset-0 border-2 border-t-transparent rounded-none ${
          isDark ? 'border-white' : 'border-black'
        } animate-spin`}
        style={{ animationDuration: '2s' }}
      />
      
      {/* Inner rotating triangle */}
      <div 
        className={`absolute inset-2 border-2 border-b-transparent border-l-transparent ${
          isDark ? 'border-white' : 'border-black'
        } animate-spin`}
        style={{ 
          animationDuration: '1.5s',
          animationDirection: 'reverse'
        }}
      />
      
      {/* Center dot */}
      <div 
        className={`absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isDark ? 'bg-white' : 'bg-black'
        } animate-pulse`}
      />
    </div>
  )
}

// Wave loader component
const WaveLoader = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 h-6 ${
            isDark ? 'bg-white' : 'bg-black'
          } animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

export default function Loading() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-none border-2 bg-background">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
          {/* Main loader */}
          <div className="flex items-center space-x-4">
            <GeometricLoader />
            <div className="flex flex-col space-y-2">
              <span className="text-lg font-medium text-foreground">
                {t('common.loading')}
              </span>
              <AnimatedDots />
            </div>
          </div>
          
          {/* Secondary wave loader */}
          <div className="flex items-center space-x-3">
            <WaveLoader />
            <span className="text-sm text-muted-foreground">
              {t('common.preparing')}
            </span>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full max-w-xs">
            <div className="w-full bg-muted rounded-none h-1">
              <div 
                className={`h-1 rounded-none ${
                  isDark ? 'bg-white' : 'bg-black'
                } animate-pulse`}
                style={{ 
                  width: '60%',
                  animationDuration: '2s'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 