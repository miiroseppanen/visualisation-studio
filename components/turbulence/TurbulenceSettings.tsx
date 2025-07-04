'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { TurbulenceSettings } from '@/lib/types'
import { 
  MIN_TURBULENCE_LINE_COUNT, 
  MAX_TURBULENCE_LINE_COUNT, 
  TURBULENCE_LINE_COUNT_STEP,
  MIN_TURBULENCE_LINE_LENGTH,
  MAX_TURBULENCE_LINE_LENGTH,
  TURBULENCE_LINE_LENGTH_STEP,
  MIN_STREAMLINE_STEPS,
  MAX_STREAMLINE_STEPS,
  STREAMLINE_STEPS_STEP,
  MIN_STREAMLINE_STEP_SIZE,
  MAX_STREAMLINE_STEP_SIZE,
  STREAMLINE_STEP_SIZE_STEP
} from '@/lib/constants'

interface TurbulenceSettingsProps {
  settings: TurbulenceSettings
  expanded: boolean
  onToggleExpanded: () => void
  onSettingsChange: (updates: Partial<TurbulenceSettings>) => void
}

export function TurbulenceSettings({ 
  settings, 
  expanded, 
  onToggleExpanded, 
  onSettingsChange 
}: TurbulenceSettingsProps) {
  return (
    <div>
      <button
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
        onClick={onToggleExpanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Turbulence Settings
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Visualization Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Visualization Mode</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="streamline-mode"
                checked={settings.streamlineMode}
                onCheckedChange={(checked) =>
                  onSettingsChange({ streamlineMode: checked as boolean })
                }
              />
              <Label htmlFor="streamline-mode" className="text-sm">
                Streamlines (unchecked = Vector Field)
              </Label>
            </div>
          </div>

          {/* Line Count */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">
                {settings.streamlineMode ? 'Streamline Density' : 'Vector Density'}
              </Label>
              <span className="text-xs text-muted-foreground">
                {settings.lineCount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[settings.lineCount]}
              onValueChange={([value]) => onSettingsChange({ lineCount: value })}
              min={MIN_TURBULENCE_LINE_COUNT}
              max={MAX_TURBULENCE_LINE_COUNT}
              step={TURBULENCE_LINE_COUNT_STEP}
              className="w-full"
            />
          </div>

          {/* Line Length (for vector mode) */}
          {!settings.streamlineMode && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Vector Length</Label>
                <span className="text-xs text-muted-foreground">
                  {settings.lineLength}px
                </span>
              </div>
              <Slider
                value={[settings.lineLength]}
                onValueChange={([value]) => onSettingsChange({ lineLength: value })}
                min={MIN_TURBULENCE_LINE_LENGTH}
                max={MAX_TURBULENCE_LINE_LENGTH}
                step={TURBULENCE_LINE_LENGTH_STEP}
                className="w-full"
              />
            </div>
          )}

          {/* Streamline Settings (for streamline mode) */}
          {settings.streamlineMode && (
            <>
              {/* Streamline Steps */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Streamline Length</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.streamlineSteps || 150} steps
                  </span>
                </div>
                <Slider
                  value={[settings.streamlineSteps || 150]}
                  onValueChange={([value]) => onSettingsChange({ streamlineSteps: value })}
                  min={MIN_STREAMLINE_STEPS}
                  max={MAX_STREAMLINE_STEPS}
                  step={STREAMLINE_STEPS_STEP}
                  className="w-full"
                />
              </div>

              {/* Streamline Step Size */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Step Size</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.streamlineStepSize || 3}px
                  </span>
                </div>
                <Slider
                  value={[settings.streamlineStepSize || 3]}
                  onValueChange={([value]) => onSettingsChange({ streamlineStepSize: value })}
                  min={MIN_STREAMLINE_STEP_SIZE}
                  max={MAX_STREAMLINE_STEP_SIZE}
                  step={STREAMLINE_STEP_SIZE_STEP}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Show Sources */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-sources"
                checked={settings.showSources}
                onCheckedChange={(checked) =>
                  onSettingsChange({ showSources: checked as boolean })
                }
              />
              <Label htmlFor="show-sources" className="text-sm">
                Show Turbulence Sources
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 