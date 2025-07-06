'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import type { NeuralNetworkAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: NeuralNetworkAnimationSettings
  onSettingsChange: (updates: Partial<NeuralNetworkAnimationSettings>) => void
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

          {/* Pulse Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Pulse Speed</Label>
              <div className="text-sm text-muted-foreground">{settings.pulseSpeed.toFixed(1)}</div>
            </div>
            <Slider
              value={[settings.pulseSpeed]}
              onValueChange={([value]) => onSettingsChange({ pulseSpeed: value })}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Learning Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Learning Speed</Label>
              <div className="text-sm text-muted-foreground">{settings.learningSpeed.toFixed(1)}</div>
            </div>
            <Slider
              value={[settings.learningSpeed]}
              onValueChange={([value]) => onSettingsChange({ learningSpeed: value })}
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
            <p>• Pulse Speed controls node pulse animation</p>
            <p>• Learning Speed affects training frequency</p>
            <p>• Watch activations flow through the network</p>
          </div>
        </div>
      )}
    </div>
  )
} 