'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { TurbulenceSettings } from '@/lib/types'

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
        className="flex items-center w-full text-left"
        onClick={onToggleExpanded}
      >
        <ChevronRight 
          className={`w-4 h-4 mr-2 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <h3 className="text-base font-medium">Turbulence Settings</h3>
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
              min={100}
              max={5000}
              step={100}
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
                min={10}
                max={80}
                step={2}
                className="w-full"
              />
            </div>
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