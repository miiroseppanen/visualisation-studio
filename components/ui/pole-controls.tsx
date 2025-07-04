"use client"

import React from 'react'
import { Plus, Trash2, Magnet } from 'lucide-react'
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
  polaritySettings?: PolaritySettings
  showPoles?: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetPoles: (poles: Pole[]) => void
  onUpdatePolarity?: (updates: Partial<PolaritySettings>) => void
  onToggleShowPoles?: (show: boolean) => void
  addButtonPosition?: 'inside' | 'outside'
  showPolarityControls?: boolean
  showGlobalControls?: boolean
}

export default function PoleControls({
  poles,
  polaritySettings,
  showPoles = true,
  expanded,
  onToggleExpanded,
  onSetPoles,
  onUpdatePolarity,
  onToggleShowPoles,
  addButtonPosition = 'inside',
  showPolarityControls = true,
  showGlobalControls = true
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

  const renderAddButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={addPole}
      className="flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add Pole
    </Button>
  )

  const renderPoleItem = (pole: Pole, index: number) => (
    <div key={pole.id} className="space-y-3 p-3 border rounded-lg bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded-full border-2 border-border flex items-center justify-center"
            style={{ backgroundColor: pole.isPositive ? '#ef4444' : '#3b82f6' }}
          >
            <Magnet className="w-2 h-2 text-white" />
          </div>
          <Label className="text-sm font-medium">{pole.name}</Label>
        </div>
        {poles.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removePole(pole.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Pole Strength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Strength</Label>
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
      {showPolarityControls && (
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
      )}

      {/* Position Display */}
      <div className="text-xs text-muted-foreground">
        Position: ({Math.round(pole.x)}, {Math.round(pole.y)})
      </div>
    </div>
  )

  if (addButtonPosition === 'outside') {
    return (
      <div className="flex items-start gap-3">
        <CollapsibleSection
          title={`Poles (${poles.length})`}
          expanded={expanded}
          onToggle={onToggleExpanded}
          className="flex-1"
        >
          <div className="space-y-4 mt-4">
            {/* Individual Pole Controls */}
            {poles.map(renderPoleItem)}

            {/* Global Pole Controls */}
            {showGlobalControls && polaritySettings && onUpdatePolarity && onToggleShowPoles && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPoles"
                    checked={showPoles}
                    onCheckedChange={(checked) => onToggleShowPoles(checked as boolean)}
                  />
                  <Label htmlFor="showPoles" className="text-sm">Show Poles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attractToPoles"
                    checked={polaritySettings.attractToPoles}
                    onCheckedChange={(checked) => onUpdatePolarity({ attractToPoles: checked as boolean })}
                  />
                  <Label htmlFor="attractToPoles" className="text-sm">Attract to Positive Poles</Label>
                  <div className="text-xs text-muted-foreground ml-2">
                    {polaritySettings.attractToPoles ? '(Magnetic)' : '(Electric)'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>
        
        {renderAddButton()}
      </div>
    )
  }

  return (
    <CollapsibleSection
      title={`Poles (${poles.length})`}
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      <div className="space-y-4 mt-4">
        {/* Add Pole Button */}
        {renderAddButton()}

        {/* Individual Pole Controls */}
        {poles.map(renderPoleItem)}

        {/* Global Pole Controls */}
        {showGlobalControls && polaritySettings && onUpdatePolarity && onToggleShowPoles && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPoles"
                checked={showPoles}
                onCheckedChange={(checked) => onToggleShowPoles(checked as boolean)}
              />
              <Label htmlFor="showPoles" className="text-sm">Show Poles</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="attractToPoles"
                checked={polaritySettings.attractToPoles}
                onCheckedChange={(checked) => onUpdatePolarity({ attractToPoles: checked as boolean })}
              />
              <Label htmlFor="attractToPoles" className="text-sm">Attract to Positive Poles</Label>
              <div className="text-xs text-muted-foreground ml-2">
                {polaritySettings.attractToPoles ? '(Magnetic)' : '(Electric)'}
              </div>
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  )
} 