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

interface GridSettingsProps {
  gridSettings: GridSettingsType
  zoomSettings: ZoomSettings
  expanded: boolean
  onToggleExpanded: () => void
  onUpdateGrid: (updates: Partial<GridSettingsType>) => void
  onUpdateZoom: (updates: Partial<ZoomSettings>) => void
}

const gridTypeConfig = [
  { type: 'rectangular', label: 'Rect', icon: Grid3X3, description: 'Square grid' },
  { type: 'triangular', label: 'Tri', icon: Triangle, description: 'Triangular pattern' },
  { type: 'hexagonal', label: 'Hex', icon: Hexagon, description: 'Hexagonal grid' },
  { type: 'radial', label: 'Radial', icon: Circle, description: 'Radial pattern' },
  { type: 'random', label: 'Random', icon: Shuffle, description: 'Random points' },
  { type: 'spiral', label: 'Spiral', icon: RotateCcw, description: 'Spiral pattern' }
] as const

export default function GridSettings({
  gridSettings,
  zoomSettings,
  expanded,
  onToggleExpanded,
  onUpdateGrid,
  onUpdateZoom
}: GridSettingsProps) {
  return (
    <CollapsibleSection
      title="Grid Settings"
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      <div className="space-y-6 mt-4">
        {/* Grid Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Grid Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {gridTypeConfig.map(({ type, label, icon: Icon, description }) => (
              <Button
                key={type}
                variant={gridSettings.type === type ? 'default' : 'outline'}
                size="sm"
                className="h-auto py-3 px-2 flex flex-col items-center gap-1 text-xs"
                onClick={() => onUpdateGrid({ type })}
                title={description}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Spacing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Grid Spacing</Label>
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
            <Label className="text-sm font-medium">Line Length</Label>
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
            <Label className="text-sm font-medium">Curve Stiffness</Label>
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
              Zoom Level
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