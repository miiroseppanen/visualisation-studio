"use client"

import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import type { Pole, PolaritySettings } from '@/lib/types'
import { generatePoleId, generatePoleName, renumberPoles } from '@/lib/physics'
import { 
  MIN_POLE_STRENGTH, 
  MAX_POLE_STRENGTH, 
  POLE_STRENGTH_STEP,
  DEFAULT_POLE_STRENGTH 
} from '@/lib/constants'

interface PoleControlsProps {
  poles: Pole[]
  polaritySettings: PolaritySettings
  showPoles: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetPoles: (poles: Pole[]) => void
  onUpdatePolarity: (updates: Partial<PolaritySettings>) => void
  onToggleShowPoles: (show: boolean) => void
}

export default function PoleControls({
  poles,
  polaritySettings,
  showPoles,
  expanded,
  onToggleExpanded,
  onSetPoles,
  onUpdatePolarity,
  onToggleShowPoles
}: PoleControlsProps) {
  const addPole = () => {
    const newPole: Pole = {
      id: generatePoleId(),
      name: generatePoleName(poles.length),
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 300,
      strength: DEFAULT_POLE_STRENGTH,
      isPositive: Math.random() > 0.5
    }
    onSetPoles([...poles, newPole])
  }

  const removePole = (id: string) => {
    if (poles.length > 1) {
      const newPoles = poles.filter(pole => pole.id !== id)
      onSetPoles(renumberPoles(newPoles))
    }
  }

  const updatePole = (id: string, updates: Partial<Pole>) => {
    onSetPoles(poles.map(pole => 
      pole.id === id ? { ...pole, ...updates } : pole
    ))
  }

  return (
    <div className="flex items-center justify-between">
      <CollapsibleSection
        title={`Poles (${poles.length})`}
        expanded={expanded}
        onToggle={onToggleExpanded}
        className="flex-1"
      >
        <div className="space-y-4">
          {/* Individual Pole Controls */}
          {poles.map((pole, index) => (
            <div key={pole.id} className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{ backgroundColor: pole.isPositive ? '#ef4444' : '#3b82f6' }}
                  />
                  <Label className="text-sm">{pole.name}</Label>
                </div>
                {poles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePole(pole.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Pole Strength */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Strength</Label>
                  <div className="text-xs text-muted-foreground">{pole.strength}</div>
                </div>
                <Slider
                  value={[pole.strength]}
                  onValueChange={([value]) => updatePole(pole.id, { strength: value })}
                  max={MAX_POLE_STRENGTH}
                  min={MIN_POLE_STRENGTH}
                  step={POLE_STRENGTH_STEP}
                  className="w-full"
                />
              </div>

              {/* Individual Polarity Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`polarity-${pole.id}`}
                  checked={pole.isPositive}
                  onCheckedChange={(checked) => updatePole(pole.id, { isPositive: checked as boolean })}
                />
                <Label htmlFor={`polarity-${pole.id}`} className="text-xs">
                  Positive Polarity {pole.isPositive ? '(+)' : '(-)'}
                </Label>
              </div>
            </div>
          ))}

          {/* Global Pole Controls */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPoles"
              checked={showPoles}
              onCheckedChange={(checked) => onToggleShowPoles(checked as boolean)}
            />
            <Label htmlFor="showPoles">Show Poles</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attractToPoles"
              checked={polaritySettings.attractToPoles}
              onCheckedChange={(checked) => onUpdatePolarity({ attractToPoles: checked as boolean })}
            />
            <Label htmlFor="attractToPoles">Attract to Positive Poles</Label>
            <div className="text-xs text-muted-foreground ml-2">
              {polaritySettings.attractToPoles ? '(Magnetic)' : '(Electric)'}
            </div>
          </div>
        </div>
      </CollapsibleSection>
      
      <Button
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={addPole}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
} 