import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  
  const toggleAnimation = () => {
    onSettingsChange({ isAnimating: !settings.isAnimating })
  }

  return (
    <div className="space-y-4">
      <CollapsibleHeader
        title={t('visualizationSettings.animation')}
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

          {/* Wind Speed */}
          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.windSpeed')}: {settings.windSpeed.toFixed(1)}</Label>
            <Slider
              value={[settings.windSpeed]}
              onValueChange={([value]) => onSettingsChange({ windSpeed: value })}
              min={0}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Wind Direction */}
          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.windDirection')}: {Math.round(settings.windDirection)}°</Label>
            <Slider
              value={[settings.windDirection]}
              onValueChange={([value]) => onSettingsChange({ windDirection: value })}
              min={0}
              max={360}
              step={1}
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
              <span>{t('visualizationSettings.reset')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 