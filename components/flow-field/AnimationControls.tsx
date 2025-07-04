import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { FlowFieldAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: FlowFieldAnimationSettings
  onSettingsChange: (updates: Partial<FlowFieldAnimationSettings>) => void
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

          {/* Particle Speed */}
          <div className="space-y-2">
            <Label className="text-sm">Particle Speed: {settings.particleSpeed.toFixed(1)}</Label>
            <Slider
              value={[settings.particleSpeed]}
              onValueChange={([value]) => onSettingsChange({ particleSpeed: value })}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Particle Life */}
          <div className="space-y-2">
            <Label className="text-sm">Particle Life: {settings.particleLife}</Label>
            <Slider
              value={[settings.particleLife]}
              onValueChange={([value]) => onSettingsChange({ particleLife: value })}
              min={50}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Flow Intensity */}
          <div className="space-y-2">
            <Label className="text-sm">Flow Intensity: {settings.flowIntensity.toFixed(1)}</Label>
            <Slider
              value={[settings.flowIntensity]}
              onValueChange={([value]) => onSettingsChange({ flowIntensity: value })}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Reset Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 