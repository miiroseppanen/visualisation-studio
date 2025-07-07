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

// Animated dots component
const AnimatedDots = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${
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
const GeometricLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const containerSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  const borderWidth = size === 'sm' ? 'border' : size === 'lg' ? 'border-4' : 'border-2'
  const dotSize = size === 'sm' ? 'w-0.5 h-0.5' : size === 'lg' ? 'w-2 h-2' : 'w-1 h-1'
  
  return (
    <div className={`relative ${containerSize}`}>
      {/* Rotating square */}
      <div 
        className={`absolute inset-0 ${borderWidth} border-t-transparent rounded-none ${
          isDark ? 'border-white' : 'border-black'
        } animate-spin`}
        style={{ animationDuration: '2s' }}
      />
      
      {/* Inner rotating triangle */}
      <div 
        className={`absolute inset-2 ${borderWidth} border-b-transparent border-l-transparent ${
          isDark ? 'border-white' : 'border-black'
        } animate-spin`}
        style={{ 
          animationDuration: '1.5s',
          animationDirection: 'reverse'
        }}
      />
      
      {/* Center dot */}
      <div 
        className={`absolute top-1/2 left-1/2 ${dotSize} -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isDark ? 'bg-white' : 'bg-black'
        } animate-pulse`}
      />
    </div>
  )
}

// Wave loader component
const WaveLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const barWidth = size === 'sm' ? 'w-0.5' : size === 'lg' ? 'w-2' : 'w-1'
  const barHeight = size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6'
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${barWidth} ${barHeight} ${
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

// Simple spinner component
const SimpleSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  const borderWidth = size === 'sm' ? 'border' : size === 'lg' ? 'border-4' : 'border-2'
  
  return (
    <div 
      className={`${spinnerSize} ${borderWidth} border-t-transparent rounded-full ${
        isDark ? 'border-white' : 'border-black'
      } animate-spin`}
    />
  )
}

export function Loader({ 
  variant = 'geometric', 
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
      case 'simple':
        return <SimpleSpinner size={size} />
      case 'geometric':
      default:
        return <GeometricLoader size={size} />
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
  variant = 'geometric',
  text 
}: { 
  variant?: 'dots' | 'geometric' | 'wave' | 'simple'
  text?: string 
}) {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6">
        <Loader variant={variant} size="lg" />
        {text && (
          <span className="text-lg font-medium text-foreground">
            {text}
          </span>
        )}
      </div>
    </div>
  )
} 