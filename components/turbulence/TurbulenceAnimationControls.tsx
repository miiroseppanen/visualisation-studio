'use client'

import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Play, Pause } from 'lucide-react'
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
      <CollapsibleHeader
        title="Animation"
        isExpanded={expanded}
        onToggle={onToggleExpanded}
      />

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
            <Label className="text-sm">Speed: {settings.speed.toFixed(1)}x</Label>
            <Slider
              value={[settings.speed]}
              onValueChange={([value]) => onSettingsChange({ speed: value })}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Animation Intensity */}
          <div className="space-y-2">
            <Label className="text-sm">Intensity: {settings.intensity.toFixed(1)}</Label>
            <Slider
              value={[settings.intensity]}
              onValueChange={([value]) => onSettingsChange({ intensity: value })}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
} 