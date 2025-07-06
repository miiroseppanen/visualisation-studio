import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const toggleAnimation = () => {
    onSettingsChange({ isAnimating: !settings.isAnimating })
  }

  return (
    <div className="space-y-4">
      <CollapsibleHeader
        title={t('visualizationSettings.animation')}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {isExpanded && (
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
                  <span>{t('visualizationSettings.pause')}</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>{t('visualizationSettings.play')}</span>
                </>
              )}
            </Button>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.rotationSpeed')}: {settings.rotationSpeed}</Label>
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
              {t('visualizationSettings.pulseEffect')}
            </Label>
          </div>

          <div className="text-xs text-gray-500">
            {t('visualizationSettings.time')}: {Math.round(settings.time / 1000)}s
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
              <span>{t('visualizationSettings.reset')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 