'use client'

import { useTheme } from '@/components/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'

interface LoaderProps {
  variant?: 'dots' | 'geometric' | 'wave' | 'simple'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  text?: string
  className?: string
}

// Simple dots component
const AnimatedDots = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${
            isDark ? 'bg-white' : 'bg-black'
          } animate-pulse`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

// Simple geometric loader
const GeometricLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const containerSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  const borderWidth = size === 'sm' ? 'border' : size === 'lg' ? 'border-2' : 'border'
  
  return (
    <div 
      className={`${containerSize} ${borderWidth} border-t-transparent rounded-full ${
        isDark ? 'border-white' : 'border-black'
      } animate-spin`}
      style={{ animationDuration: '1s' }}
    />
  )
}

// Simple wave loader
const WaveLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const barWidth = size === 'sm' ? 'w-0.5' : size === 'lg' ? 'w-1' : 'w-0.5'
  const barHeight = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-6' : 'h-4'
  
  return (
    <div className="flex items-center space-x-0.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${barWidth} ${barHeight} ${
            isDark ? 'bg-white' : 'bg-black'
          } animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )
}

// Simple spinner component
const SimpleSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  const borderWidth = size === 'sm' ? 'border' : size === 'lg' ? 'border-2' : 'border'
  
  return (
    <div 
      className={`${spinnerSize} ${borderWidth} border-t-transparent rounded-full ${
        isDark ? 'border-white' : 'border-black'
      } animate-spin`}
      style={{ animationDuration: '1s' }}
    />
  )
}

export function Loader({ 
  variant = 'simple', 
  size = 'md', 
  showText = false, 
  text,
  className = '' 
}: LoaderProps) {
  const { t } = useTranslation()
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <AnimatedDots size={size} />
      case 'wave':
        return <WaveLoader size={size} />
      case 'geometric':
        return <GeometricLoader size={size} />
      case 'simple':
      default:
        return <SimpleSpinner size={size} />
    }
  }
  
  const displayText = text || t('common.loading')
  
  if (showText) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {renderLoader()}
        <span className="text-sm text-muted-foreground">{displayText}</span>
      </div>
    )
  }
  
  return (
    <div className={className}>
      {renderLoader()}
    </div>
  )
}

// Full screen loader component
export function FullScreenLoader({ 
  variant = 'simple',
  text 
}: { 
  variant?: 'dots' | 'geometric' | 'wave' | 'simple'
  text?: string 
}) {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader variant={variant} size="lg" />
        {text && (
          <span className="text-base text-muted-foreground">
            {text}
          </span>
        )}
      </div>
    </div>
  )
} 