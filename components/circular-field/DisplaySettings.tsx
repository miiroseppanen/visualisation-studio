import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import type { CircularFieldDisplaySettings } from '@/lib/types'

interface DisplaySettingsProps {
  settings: CircularFieldDisplaySettings
  onSettingsChange: (updates: Partial<CircularFieldDisplaySettings>) => void
  isExpanded: boolean
  onToggle: () => void
}

export function DisplaySettings({ 
  settings, 
  onSettingsChange, 
  isExpanded, 
  onToggle 
}: DisplaySettingsProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <CollapsibleHeader
        title={t('visualizationSettings.displaySettings')}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {isExpanded && (
        <div className="space-y-4 pl-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-field-lines"
                checked={settings.showFieldLines}
                onCheckedChange={(checked) => 
                  onSettingsChange({ showFieldLines: checked as boolean })
                }
              />
              <Label htmlFor="show-field-lines" className="text-sm">
                {t('visualizationSettings.showFieldLines')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-poles"
                checked={settings.showPoles}
                onCheckedChange={(checked) => 
                  onSettingsChange({ showPoles: checked as boolean })
                }
              />
              <Label htmlFor="show-poles" className="text-sm">
                {t('visualizationSettings.showPoles')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-pole-labels"
                checked={settings.showPoleLabels}
                onCheckedChange={(checked) => 
                  onSettingsChange({ showPoleLabels: checked as boolean })
                }
              />
              <Label htmlFor="show-pole-labels" className="text-sm">
                {t('visualizationSettings.showPoleLabels')}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.lineWeight')}: {settings.lineWeight.toFixed(1)}</Label>
            <Slider
              value={[settings.lineWeight]}
              onValueChange={([value]) => onSettingsChange({ lineWeight: value })}
              min={0.5}
              max={4}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.opacity')}: {Math.round(settings.opacity * 100)}%</Label>
            <Slider
              value={[settings.opacity]}
              onValueChange={([value]) => onSettingsChange({ opacity: value })}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
} 