'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { useTranslation } from 'react-i18next'
import type { TopographySettings } from '@/lib/topography-physics'
import type { TopographyPanelState } from '@/lib/types'

interface TopographySettingsProps {
  settings: TopographySettings
  panelState: TopographyPanelState
  onUpdateSettings: (updates: Partial<TopographySettings>) => void
  onUpdatePanelState: (updates: Partial<TopographyPanelState>) => void
}

export function TopographySettings({
  settings,
  panelState,
  onUpdateSettings,
  onUpdatePanelState,
}: TopographySettingsProps) {
  const { t } = useTranslation()
  
  const toggleExpanded = () => {
    onUpdatePanelState({ topographySettingsExpanded: !panelState.topographySettingsExpanded })
  }

  return (
    <div className="space-y-3">
      <CollapsibleHeader
        title={t('visualizationSettings.topographySettings')}
        isExpanded={panelState.topographySettingsExpanded}
        onToggle={toggleExpanded}
      />

      {panelState.topographySettingsExpanded && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              {t('visualizationSettings.contourInterval')}: {settings.contourInterval}m
            </Label>
            <Slider
              value={[settings.contourInterval]}
              onValueChange={(value) => onUpdateSettings({ contourInterval: value[0] })}
              min={10}
              max={200}
              step={10}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Elevation difference between contour lines
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t('visualizationSettings.minElevation')}: {settings.minElevation}m
            </Label>
            <Slider
              value={[settings.minElevation]}
              onValueChange={(value) => onUpdateSettings({ minElevation: value[0] })}
              min={-500}
              max={1000}
              step={50}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t('visualizationSettings.maxElevation')}: {settings.maxElevation}m
            </Label>
            <Slider
              value={[settings.maxElevation]}
              onValueChange={(value) => onUpdateSettings({ maxElevation: value[0] })}
              min={500}
              max={3000}
              step={50}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t('visualizationSettings.resolution')}: {settings.resolution.toFixed(1)}x
            </Label>
            <Slider
              value={[settings.resolution]}
              onValueChange={(value) => onUpdateSettings({ resolution: value[0] })}
              min={0.5}
              max={3.0}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Higher values create more detailed contours but slower rendering
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t('visualizationSettings.smoothing')}: {settings.smoothing.toFixed(1)}
            </Label>
            <Slider
              value={[settings.smoothing]}
              onValueChange={(value) => onUpdateSettings({ smoothing: value[0] })}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Smooths contour lines to reduce jagged edges
            </p>
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('visualizationSettings.elevationRange')}: {settings.maxElevation - settings.minElevation}m</div>
              <div>{t('visualizationSettings.contourCount')}: ~{Math.floor((settings.maxElevation - settings.minElevation) / settings.contourInterval)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 