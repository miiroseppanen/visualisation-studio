import { ChevronRight, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { TopographyAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: TopographyAnimationSettings
  onSettingsChange: (updates: Partial<TopographyAnimationSettings>) => void
  onReset: () => void
  expanded: boolean
  onToggleExpanded: () => void
}

export function AnimationControls({ 
  settings, 
  onSettingsChange, 
  onReset,
  expanded, 
  onToggleExpanded 
}: AnimationControlsProps) {
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
          <div className="flex items-center gap-2">
            <Button
              variant={settings.isAnimating ? "default" : "outline"}
              size="sm"
              onClick={() => onSettingsChange({ isAnimating: !settings.isAnimating })}
              className="flex items-center gap-2"
            >
              {settings.isAnimating ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Play
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Wind Speed: {settings.windSpeed.toFixed(1)}</Label>
            <Slider
              value={[settings.windSpeed]}
              onValueChange={([value]) => onSettingsChange({ windSpeed: value })}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Wind Direction: {Math.round(settings.windDirection)}°</Label>
            <Slider
              value={[settings.windDirection]}
              onValueChange={([value]) => onSettingsChange({ windDirection: value })}
              min={0}
              max={360}
              step={15}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contour-pulse"
              checked={settings.contourPulse}
              onCheckedChange={(checked) => 
                onSettingsChange({ contourPulse: checked as boolean })
              }
            />
            <Label htmlFor="contour-pulse" className="text-sm">
              Contour Pulse Effect
            </Label>
          </div>

          <div className="text-xs text-gray-500">
            Time: {Math.round(settings.time / 1000)}s
          </div>
        </div>
      )}
    </div>
  )
} 