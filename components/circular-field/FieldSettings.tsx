import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto font-normal"
      >
        <span className="text-sm font-medium">Field Settings</span>
        <ChevronRight 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </Button>

      {isExpanded && (
        <div className="space-y-4 pl-4">
          <div className="space-y-2">
            <Label className="text-sm">Line Count: {settings.lineCount}</Label>
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
            <Label className="text-sm">Line Spacing: {settings.lineSpacing}px</Label>
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