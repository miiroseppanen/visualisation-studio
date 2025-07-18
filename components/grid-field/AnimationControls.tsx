"use client"

import React from 'react'
import { ChevronDown, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { AnimationSettings } from '@/lib/types'
import { 
  MIN_WIND_STRENGTH, 
  MAX_WIND_STRENGTH, 
  MIN_WIND_SPEED,
  MAX_WIND_SPEED
} from '@/lib/constants'
import { useTranslation } from 'react-i18next'

interface AnimationControlsProps {
  animationSettings: AnimationSettings
  expanded: boolean
  onToggleExpanded: () => void
  onUpdateAnimation: (updates: Partial<AnimationSettings>) => void
}

export default function AnimationControls({
  animationSettings,
  expanded,
  onToggleExpanded,
  onUpdateAnimation
}: AnimationControlsProps) {
  const { t } = useTranslation()
  return (
    <div>
      <button
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
        onClick={onToggleExpanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {t('visualizationSettings.animation')}
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Play/Pause Animation */}
          <div className="flex items-center justify-center">
            <Button
              variant={animationSettings.isAnimating ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateAnimation({ isAnimating: !animationSettings.isAnimating })}
              className="flex items-center gap-2"
            >
              {animationSettings.isAnimating ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span className="truncate">{t('visualizationSettings.pause')}</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span className="truncate">{t('visualizationSettings.play')}</span>
                </>
              )}
            </Button>
          </div>

          {/* Wind Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('visualizationSettings.windStrength')}</Label>
              <div className="text-xs text-muted-foreground">{animationSettings.windStrength.toFixed(2)}</div>
            </div>
            <Slider
              value={[animationSettings.windStrength]}
              onValueChange={([value]) => onUpdateAnimation({ windStrength: value })}
              max={MAX_WIND_STRENGTH}
              min={MIN_WIND_STRENGTH}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Wind Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('visualizationSettings.windSpeed')}</Label>
              <div className="text-xs text-muted-foreground">{animationSettings.windSpeed.toFixed(1)}x</div>
            </div>
            <Slider
              value={[animationSettings.windSpeed]}
              onValueChange={([value]) => onUpdateAnimation({ windSpeed: value })}
              max={MAX_WIND_SPEED}
              min={MIN_WIND_SPEED}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
} 