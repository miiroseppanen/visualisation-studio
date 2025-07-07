'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/ui/ThemeProvider'
import { Loader } from '@/components/ui/loader'

export default function Loading() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-none border-2 bg-background">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
          {/* Main unified line loader */}
          <div className="w-full max-w-xs">
            <Loader size="lg" />
          </div>
          
          {/* Loading text */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-lg font-medium text-foreground">
              {t('common.loading')}
            </span>
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