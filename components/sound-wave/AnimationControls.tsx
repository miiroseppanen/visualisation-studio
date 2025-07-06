'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import type { SoundWaveAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: SoundWaveAnimationSettings
  onSettingsChange: (updates: Partial<SoundWaveAnimationSettings>) => void
  onReset: () => void
  expanded: boolean
  onToggleExpanded: () => void
}

export default function AnimationControls({
  settings,
  onSettingsChange,
  onReset,
  expanded,
  onToggleExpanded
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
        {settings.isAnimating ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        Animation Controls
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Animation Toggle */}
          <div className="space-y-2">
            <Button
              variant={settings.isAnimating ? "destructive" : "default"}
              size="sm"
              onClick={() => onSettingsChange({ isAnimating: !settings.isAnimating })}
              className="w-full"
            >
              {settings.isAnimating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Animation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Animation
                </>
              )}
            </Button>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Frequency</Label>
              <div className="text-sm text-muted-foreground">{settings.frequency.toFixed(0)}Hz</div>
            </div>
            <Slider
              value={[settings.frequency]}
              onValueChange={([value]) => onSettingsChange({ frequency: value })}
              max={2000}
              min={20}
              step={10}
              className="w-full"
            />
          </div>

          {/* Amplitude */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Amplitude</Label>
              <div className="text-sm text-muted-foreground">{settings.amplitude.toFixed(2)}</div>
            </div>
            <Slider
              value={[settings.amplitude]}
              onValueChange={([value]) => onSettingsChange({ amplitude: value })}
              max={2}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Wave Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Wave Speed</Label>
              <div className="text-sm text-muted-foreground">{settings.waveSpeed.toFixed(1)}</div>
            </div>
            <Slider
              value={[settings.waveSpeed]}
              onValueChange={([value]) => onSettingsChange({ waveSpeed: value })}
              max={3}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Reset Button */}
          <div className="space-y-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('visualizationSettings.resetToDefaults')}
            </Button>
          </div>

          {/* Animation Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Frequency controls wave oscillation rate</p>
            <p>• Amplitude affects wave height</p>
            <p>• Wave Speed controls animation speed</p>
          </div>
        </div>
      )}
    </div>
  )
} 