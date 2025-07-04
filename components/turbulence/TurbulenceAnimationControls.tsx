'use client'

import { ChevronDown, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { TurbulenceAnimationSettings } from '@/lib/types'

interface TurbulenceAnimationControlsProps {
  settings: TurbulenceAnimationSettings
  onSettingsChange: (updates: Partial<TurbulenceAnimationSettings>) => void
  expanded: boolean
  onToggleExpanded: () => void
}

export function TurbulenceAnimationControls({
  settings,
  onSettingsChange,
  expanded,
  onToggleExpanded,
}: TurbulenceAnimationControlsProps) {
  const toggleAnimation = () => {
    onSettingsChange({ isAnimating: !settings.isAnimating })
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onToggleExpanded}
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Animation
      </button>

      {expanded && (
        <div className="space-y-4 pl-4">
          {/* Play/Pause Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={toggleAnimation}
              variant={settings.isAnimating ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {settings.isAnimating ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Play</span>
                </>
              )}
            </Button>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Animation Speed</Label>
              <span className="text-xs text-muted-foreground">
                {settings.speed.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.speed]}
              onValueChange={([value]) => onSettingsChange({ speed: value })}
              min={0.1}
              max={3.0}
              step={0.1}
              className="w-full"
              disabled={!settings.isAnimating}
            />
          </div>

          {/* Flow Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Flow Intensity</Label>
              <span className="text-xs text-muted-foreground">
                {settings.intensity.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.intensity]}
              onValueChange={([value]) => onSettingsChange({ intensity: value })}
              min={0.1}
              max={3.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Animation Time Display - Update less frequently */}
          <div className="text-center text-xs text-muted-foreground">
            Time: {Math.floor(settings.time * 10) / 10}s
          </div>
        </div>
      )}
    </div>
  )
} 