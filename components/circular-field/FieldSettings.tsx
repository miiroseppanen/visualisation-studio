import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useTranslation } from 'react-i18next'
import type { CircularFieldSettings } from '@/lib/circular-field-physics'

interface FieldSettingsProps {
  settings: CircularFieldSettings
  onSettingsChange: (updates: Partial<CircularFieldSettings>) => void
  isExpanded: boolean
  onToggle: () => void
}

export function FieldSettings({ 
  settings, 
  onSettingsChange, 
  isExpanded, 
  onToggle 
}: FieldSettingsProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <CollapsibleHeader
        title={t('visualizationSettings.fieldSettings')}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {isExpanded && (
        <div className="space-y-4 pl-4">
          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.lineCount')}: {settings.lineCount}</Label>
            <Slider
              value={[settings.lineCount]}
              onValueChange={([value]) => onSettingsChange({ lineCount: value })}
              min={3}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">{t('visualizationSettings.lineSpacing')}: {settings.lineSpacing}px</Label>
            <Slider
              value={[settings.lineSpacing]}
              onValueChange={([value]) => onSettingsChange({ lineSpacing: value })}
              min={10}
              max={50}
              step={1}
              className="w-full"
            />
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