import { ChevronDown, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { CircularFieldAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: CircularFieldAnimationSettings
  onSettingsChange: (updates: Partial<CircularFieldAnimationSettings>) => void
  onReset: () => void
  isExpanded: boolean
  onToggle: () => void
}

export function AnimationControls({ 
  settings, 
  onSettingsChange, 
  onReset,
  isExpanded, 
  onToggle 
}: AnimationControlsProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Animation
      </button>

      {isExpanded && (
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
            <Label className="text-sm">Rotation Speed: {settings.rotationSpeed}</Label>
            <Slider
              value={[settings.rotationSpeed]}
              onValueChange={([value]) => onSettingsChange({ rotationSpeed: value })}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pulse-effect"
              checked={settings.pulseEffect}
              onCheckedChange={(checked) => 
                onSettingsChange({ pulseEffect: checked as boolean })
              }
            />
            <Label htmlFor="pulse-effect" className="text-sm">
              Pulse Effect
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