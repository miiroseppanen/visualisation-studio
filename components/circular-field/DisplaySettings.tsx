import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
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
  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Display Settings
      </button>

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
                Show Field Lines
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
                Show Poles
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
                Show Pole Labels
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Line Weight: {settings.lineWeight.toFixed(1)}</Label>
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
            <Label className="text-sm">Opacity: {Math.round(settings.opacity * 100)}%</Label>
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