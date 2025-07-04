"use client"

import React from 'react'
import { Plus, Magnet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { ListCard } from '@/components/ui/list-card'
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

  const switchPolePolarity = (id: string, newPolarity: string) => {
    const isPositive = newPolarity === 'positive'
    updatePole(id, { isPositive })
  }

  const polarityOptions = [
    {
      value: 'positive',
      label: 'Positive (+)',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: '#EF4444' // Flat red
    },
    {
      value: 'negative',
      label: 'Negative (-)',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: '#3B82F6' // Flat blue
    }
  ]

  const renderAddButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={addPole}
      className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <Plus className="w-4 h-4" />
      Add Pole
    </Button>
  )

  const renderPoleItem = (pole: Pole, index: number) => (
    <ListCard
      key={pole.id}
      icon={<Magnet className="w-8 h-8 text-white" />}
      iconColor={pole.isPositive ? '#EF4444' : '#3B82F6'}
      title={pole.name}
      subtitle={`Position: (${Math.round(pole.x)}, ${Math.round(pole.y)})`}
      onRemove={poles.length > 1 ? () => removePole(pole.id) : undefined}
      showRemoveButton={poles.length > 1}
      typeOptions={polarityOptions}
      currentType={pole.isPositive ? 'positive' : 'negative'}
      onTypeChange={(newType) => switchPolePolarity(pole.id, newType)}
      showTypeSwitch={true}
    >
      {/* Pole Strength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600 dark:text-gray-300">Strength</Label>
          <div className="text-xs text-gray-600 dark:text-gray-300">{pole.strength}</div>
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
    </ListCard>
  )

  if (addButtonPosition === 'outside') {
    return (
      <div className="flex items-start gap-3">
        <CollapsibleSection
          title={`Poles (${poles.length})`}
          defaultOpen={expanded}
          className="flex-1"
        >
          <div className="space-y-4 mt-4">
            {/* Individual Pole Controls */}
            {poles.map(renderPoleItem)}

            {/* Add Pole Button */}
            {renderAddButton()}

            {/* Global Pole Controls */}
            {showGlobalControls && polaritySettings && onUpdatePolarity && onToggleShowPoles && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPoles"
                    checked={showPoles}
                    onCheckedChange={(checked) => onToggleShowPoles(checked as boolean)}
                  />
                  <Label htmlFor="showPoles" className="text-sm text-gray-900 dark:text-white">Show Poles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attractToPoles"
                    checked={polaritySettings.attractToPoles}
                    onCheckedChange={(checked) => onUpdatePolarity({ attractToPoles: checked as boolean })}
                  />
                  <Label htmlFor="attractToPoles" className="text-sm text-gray-900 dark:text-white">Attract to Positive Poles</Label>
                  <div className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                    {polaritySettings.attractToPoles ? '(Magnetic)' : '(Electric)'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>
      </div>
    )
  }

  return (
    <CollapsibleSection
      title={`Poles (${poles.length})`}
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Individual Pole Controls */}
        {poles.map(renderPoleItem)}

        {/* Add Pole Button */}
        {renderAddButton()}

        {/* Global Pole Controls */}
        {showGlobalControls && polaritySettings && onUpdatePolarity && onToggleShowPoles && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPoles"
                checked={showPoles}
                onCheckedChange={(checked) => onToggleShowPoles(checked as boolean)}
              />
              <Label htmlFor="showPoles" className="text-sm text-gray-900 dark:text-white">Show Poles</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="attractToPoles"
                checked={polaritySettings.attractToPoles}
                onCheckedChange={(checked) => onUpdatePolarity({ attractToPoles: checked as boolean })}
              />
              <Label htmlFor="attractToPoles" className="text-sm text-gray-900 dark:text-white">Attract to Positive Poles</Label>
              <div className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                {polaritySettings.attractToPoles ? '(Magnetic)' : '(Electric)'}
              </div>
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  )
} 