"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { 
  Grid3X3, 
  Triangle, 
  Hexagon, 
  Circle, 
  Shuffle, 
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import type { GridSettings as GridSettingsType, ZoomSettings } from '@/lib/types'
import { 
  MIN_GRID_SPACING, 
  MAX_GRID_SPACING, 
  GRID_SPACING_STEP,
  MIN_LINE_LENGTH,
  MAX_LINE_LENGTH,
  LINE_LENGTH_STEP,
  MIN_CURVE_STIFFNESS,
  MAX_CURVE_STIFFNESS,
  CURVE_STIFFNESS_STEP,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL
} from '@/lib/constants'
import { useTranslation } from 'react-i18next'

interface GridSettingsProps {
  gridSettings: GridSettingsType
  zoomSettings: ZoomSettings
  expanded: boolean
  onToggleExpanded: () => void
  onUpdateGrid: (updates: Partial<GridSettingsType>) => void
  onUpdateZoom: (updates: Partial<ZoomSettings>) => void
}

const gridTypeConfig = [
  { type: 'rectangular', labelKey: 'visualizationSettings.rect', icon: Grid3X3, descriptionKey: 'visualizationSettings.squareGrid' },
  { type: 'triangular', labelKey: 'visualizationSettings.tri', icon: Triangle, descriptionKey: 'visualizationSettings.triangularPattern' },
  { type: 'hexagonal', labelKey: 'visualizationSettings.hex', icon: Hexagon, descriptionKey: 'visualizationSettings.hexagonalGrid' },
  { type: 'radial', labelKey: 'visualizationSettings.radial', icon: Circle, descriptionKey: 'visualizationSettings.radialPattern' },
  { type: 'random', labelKey: 'visualizationSettings.random', icon: Shuffle, descriptionKey: 'visualizationSettings.randomPoints' },
  { type: 'spiral', labelKey: 'visualizationSettings.spiral', icon: RotateCcw, descriptionKey: 'visualizationSettings.spiralPattern' }
] as const

export default function GridSettings({
  gridSettings,
  zoomSettings,
  expanded,
  onToggleExpanded,
  onUpdateGrid,
  onUpdateZoom
}: GridSettingsProps) {
  const { t } = useTranslation()
  console.log('t(gridSettings):', t('visualizationSettings.gridSettings'));
  return (
    <CollapsibleSection
      title={<span className="truncate">{t('visualizationSettings.gridSettings')}</span>}
      defaultOpen={expanded}
    >
      <div className="space-y-6 mt-4">
        {/* Grid Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('visualizationSettings.gridType')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {gridTypeConfig.map(({ type, labelKey, icon: Icon, descriptionKey }) => (
              <Button
                key={type}
                variant={gridSettings.type === type ? 'default' : 'outline'}
                size="sm"
                className="h-auto py-3 px-2 flex flex-col items-center gap-1 text-xs"
                onClick={() => onUpdateGrid({ type })}
                title={t(descriptionKey)}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{t(labelKey)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Spacing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t('visualizationSettings.gridSpacing')}</Label>
            <div className="text-sm text-muted-foreground">{gridSettings.spacing}px</div>
          </div>
          <Slider
            value={[gridSettings.spacing]}
            onValueChange={([value]) => onUpdateGrid({ spacing: value })}
            max={MAX_GRID_SPACING}
            min={MIN_GRID_SPACING}
            step={GRID_SPACING_STEP}
            className="w-full"
          />
        </div>

        {/* Line Length */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t('visualizationSettings.lineLength')}</Label>
            <div className="text-sm text-muted-foreground">{gridSettings.lineLength}px</div>
          </div>
          <Slider
            value={[gridSettings.lineLength]}
            onValueChange={([value]) => onUpdateGrid({ lineLength: value })}
            max={MAX_LINE_LENGTH}
            min={MIN_LINE_LENGTH}
            step={LINE_LENGTH_STEP}
            className="w-full"
          />
        </div>

        {/* Curve Stiffness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t('visualizationSettings.curveStiffness')}</Label>
            <div className="text-sm text-muted-foreground">{Math.round(gridSettings.curveStiffness * 100)}%</div>
          </div>
          <Slider
            value={[gridSettings.curveStiffness * 100]}
            onValueChange={([value]) => onUpdateGrid({ curveStiffness: value / 100 })}
            max={MAX_CURVE_STIFFNESS * 100}
            min={MIN_CURVE_STIFFNESS * 100}
            step={CURVE_STIFFNESS_STEP * 100}
            className="w-full"
          />
        </div>

        {/* Zoom Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1">
              <ZoomIn className="h-3 w-3" />
              {t('visualizationSettings.zoomLevel')}
            </Label>
            <div className="text-sm text-muted-foreground">{Math.round(zoomSettings.level * 100)}%</div>
          </div>
          <Slider
            value={[zoomSettings.level * 100]}
            onValueChange={([value]) => onUpdateZoom({ level: value / 100 })}
            max={MAX_ZOOM_LEVEL * 100}
            min={MIN_ZOOM_LEVEL * 100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </CollapsibleSection>
  )
} 