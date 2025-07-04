'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import type { TopographyDisplaySettings } from '@/lib/types'
import type { TopographyPanelState } from '@/lib/types'

interface TopographyDisplaySettingsProps {
  settings: TopographyDisplaySettings
  panelState: TopographyPanelState
  onUpdateSettings: (updates: Partial<TopographyDisplaySettings>) => void
  onUpdatePanelState: (updates: Partial<TopographyPanelState>) => void
}

export function TopographyDisplaySettings({
  settings,
  panelState,
  onUpdateSettings,
  onUpdatePanelState,
}: TopographyDisplaySettingsProps) {
  const toggleExpanded = () => {
    onUpdatePanelState({ displaySettingsExpanded: !panelState.displaySettingsExpanded })
  }

  return (
    <div className="space-y-3">
      <CollapsibleHeader
        title="Display Settings"
        isExpanded={panelState.displaySettingsExpanded}
        onToggle={toggleExpanded}
      />

      {panelState.displaySettingsExpanded && (
        <div className="space-y-4">
          {/* Visibility Controls */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Visibility</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-contour-lines"
                checked={settings.showContourLines}
                onCheckedChange={(checked) =>
                  onUpdateSettings({ showContourLines: !!checked })
                }
              />
              <Label htmlFor="show-contour-lines" className="text-sm">
                Show Contour Lines
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-elevation-points"
                checked={settings.showElevationPoints}
                onCheckedChange={(checked) =>
                  onUpdateSettings({ showElevationPoints: !!checked })
                }
              />
              <Label htmlFor="show-elevation-points" className="text-sm">
                Show Elevation Points
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-elevation-labels"
                checked={settings.showElevationLabels}
                onCheckedChange={(checked) =>
                  onUpdateSettings({ showElevationLabels: !!checked })
                }
              />
              <Label htmlFor="show-elevation-labels" className="text-sm">
                Show Elevation Labels
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-gradient-field"
                checked={settings.showGradientField}
                onCheckedChange={(checked) =>
                  onUpdateSettings({ showGradientField: !!checked })
                }
              />
              <Label htmlFor="show-gradient-field" className="text-sm">
                Show Slope Arrows
              </Label>
            </div>
          </div>

          {/* Line Weight Controls */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Line Weight</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">
                Minor Contour Weight: {settings.lineWeight.toFixed(1)}px
              </Label>
              <Slider
                value={[settings.lineWeight]}
                onValueChange={(value) => onUpdateSettings({ lineWeight: value[0] })}
                min={0.5}
                max={3}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Major Contour Weight: {settings.majorContourWeight.toFixed(1)}px
              </Label>
              <Slider
                value={[settings.majorContourWeight]}
                onValueChange={(value) => onUpdateSettings({ majorContourWeight: value[0] })}
                min={0.5}
                max={5}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Major Contour Interval: {settings.majorContourInterval === 0 ? 'Off (all lines same weight)' : `Every ${settings.majorContourInterval} lines`}
              </Label>
              <Slider
                value={[settings.majorContourInterval]}
                onValueChange={(value) => onUpdateSettings({ majorContourInterval: value[0] })}
                min={0}
                max={10}
                step={1}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {settings.majorContourInterval === 0 ? 'Set to 0 to disable major contour lines' : 'How often to draw thicker contour lines'}
              </p>
            </div>
          </div>

          {/* Style Information */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Style: Black and white topographic lines</div>
              <div>Major/Minor: {settings.majorContourWeight.toFixed(1)}px / {settings.lineWeight.toFixed(1)}px</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 