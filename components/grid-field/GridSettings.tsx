"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
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
      <div className="space-y-4 mt-4">
        {/* Grid Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Grid Type</Label>
            <div className="flex items-center space-x-1">
              <Button
                variant={gridSettings.type === 'rectangular' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'rectangular' })}
              >
                Rect
              </Button>
              <Button
                variant={gridSettings.type === 'triangular' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'triangular' })}
              >
                Tri
              </Button>
              <Button
                variant={gridSettings.type === 'hexagonal' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'hexagonal' })}
              >
                Hex
              </Button>
              <Button
                variant={gridSettings.type === 'radial' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'radial' })}
              >
                Radial
              </Button>
              <Button
                variant={gridSettings.type === 'random' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'random' })}
              >
                Random
              </Button>
              <Button
                variant={gridSettings.type === 'spiral' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onUpdateGrid({ type: 'spiral' })}
              >
                Spiral
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Spacing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Grid Spacing</Label>
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
            <Label>Line Length</Label>
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
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Curve Stiffness:</span>
            <span>{Math.round(gridSettings.curveStiffness * 100)}%</span>
          </div>
          <Slider
            value={[gridSettings.curveStiffness * 100]}
            onValueChange={([value]) => onUpdateGrid({ curveStiffness: value / 100 })}
            max={MAX_CURVE_STIFFNESS}
            min={MIN_CURVE_STIFFNESS}
            step={CURVE_STIFFNESS_STEP}
            className="w-full"
          />
        </div>

        {/* Zoom Level */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Zoom Level:</span>
            <span>{Math.round(zoomSettings.level * 100)}%</span>
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