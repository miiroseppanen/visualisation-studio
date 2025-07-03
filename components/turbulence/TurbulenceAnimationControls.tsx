'use client'

import { ChevronRight, Play, Pause } from 'lucide-react'
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
      <Button
        variant="ghost"
        onClick={onToggleExpanded}
        className="w-full justify-between p-0 h-auto font-normal"
      >
        <span className="text-sm font-medium">Animation</span>
        <ChevronRight 
          className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} 
        />
      </Button>

      {expanded && (
        <div className="space-y-4 pl-4">
          {/* Play/Pause Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={toggleAnimation}
              variant={settings.isAnimating ? "default" : "outline"}
              size="sm"
              className="flex items-center space-x-2"
            >
              {settings.isAnimating ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
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

          {/* Animation Time Display */}
          <div className="text-center text-xs text-muted-foreground">
            Time: {settings.time.toFixed(1)}s
          </div>
        </div>
      )}
    </div>
  )
} 