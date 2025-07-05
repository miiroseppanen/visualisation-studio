'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Plus, Magnet, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import type { Pole } from '@/lib/types'
import type { FlowFieldPanelState } from '@/lib/types'
import { COLOR_PALETTE } from '@/lib/constants'

interface QuantumPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'attractor' | 'repeller' | 'vortex' | 'quantum'
  phase: number
  frequency: number
  radius: number
}

interface FlowPoleControlsProps {
  poles: QuantumPole[]
  selectedPoleType: 'attractor' | 'repeller' | 'vortex' | 'quantum'
  isAddingPole: boolean
  showPoles: boolean
  showFieldLines: boolean
  fieldLineDensity: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetSelectedPoleType: (type: 'attractor' | 'repeller' | 'vortex' | 'quantum') => void
  onSetIsAddingPole: (adding: boolean) => void
  onRemovePole: (id: string) => void
  onSetShowPoles: (show: boolean) => void
  onSetShowFieldLines: (show: boolean) => void
  onSetFieldLineDensity: (density: number) => void
  onUpdatePole?: (id: string, updates: Partial<QuantumPole>) => void
}

export default function FlowPoleControls({
  poles,
  selectedPoleType,
  isAddingPole,
  showPoles,
  showFieldLines,
  fieldLineDensity,
  expanded,
  onToggleExpanded,
  onSetSelectedPoleType,
  onSetIsAddingPole,
  onRemovePole,
  onSetShowPoles,
  onSetShowFieldLines,
  onSetFieldLineDensity,
  onUpdatePole
}: FlowPoleControlsProps) {
  const poleTypeOptions = [
    {
      value: 'attractor',
      label: 'Attractor',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.positive
    },
    {
      value: 'repeller',
      label: 'Repeller',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.negative
    },
    {
      value: 'vortex',
      label: 'Vortex',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.neutral
    },
    {
      value: 'quantum',
      label: 'Quantum',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.positive
    }
  ]

  const switchPoleType = (id: string, newType: string) => {
    if (onUpdatePole) {
      onUpdatePole(id, { type: newType as 'attractor' | 'repeller' | 'vortex' | 'quantum' })
    }
  }

  return (
    <CollapsibleSection
      title={`Magnetic Poles (${poles.length})`}
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Add Pole Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">Add New Pole</Label>
          
          {/* Add Pole Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetIsAddingPole(!isAddingPole)}
            className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingPole ? 'Cancel Adding' : 'Add Pole'}
          </Button>
          
          {/* Quick Type Selection for New Poles */}
          {isAddingPole && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600 dark:text-gray-300">Default Type for New Poles</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedPoleType === 'attractor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('attractor')}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  Attractor
                </Button>
                <Button
                  variant={selectedPoleType === 'repeller' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('repeller')}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  Repeller
                </Button>
                <Button
                  variant={selectedPoleType === 'vortex' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('vortex')}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  Vortex
                </Button>
                <Button
                  variant={selectedPoleType === 'quantum' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('quantum')}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  Quantum
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Global Strength Control */}
        {poles.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">Global Strength</Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-600 dark:text-gray-300">All Poles Strength</Label>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {poles.length > 0 ? Math.round(poles.reduce((sum, pole) => sum + pole.strength, 0) / poles.length) : 0}
                </span>
              </div>
              <Slider
                value={[poles.length > 0 ? Math.round(poles.reduce((sum, pole) => sum + pole.strength, 0) / poles.length) : 100]}
                onValueChange={(value) => {
                  if (onUpdatePole) {
                    poles.forEach(pole => {
                      onUpdatePole(pole.id, { strength: value[0] })
                    })
                  }
                }}
                max={200}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Existing Poles */}
        {poles.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">Current Poles</Label>
            {poles.map(pole => (
              <div key={pole.id} className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <ListCard
                  icon={<Magnet className="w-8 h-8 text-white" />}
                  iconColor={pole.type === 'attractor' ? COLOR_PALETTE.positive : 
                             pole.type === 'repeller' ? COLOR_PALETTE.negative :
                             pole.type === 'vortex' ? COLOR_PALETTE.neutral : COLOR_PALETTE.positive}
                  title={pole.type}
                  subtitle={`Position: (${Math.round(pole.x)}, ${Math.round(pole.y)})`}
                  onRemove={() => onRemovePole(pole.id)}
                  typeOptions={poleTypeOptions}
                  currentType={pole.type}
                  onTypeChange={(newType) => switchPoleType(pole.id, newType)}
                  showTypeSwitch={!!onUpdatePole}
                />
                
                {/* Strength Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">Strength</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{pole.strength}</span>
                  </div>
                  <Slider
                    value={[pole.strength]}
                    onValueChange={(value) => {
                      if (onUpdatePole) {
                        onUpdatePole(pole.id, { strength: value[0] })
                      }
                    }}
                    max={200}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">Display Options</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPoles"
              checked={showPoles}
              onCheckedChange={(checked) => onSetShowPoles(checked as boolean)}
            />
            <Label htmlFor="showPoles" className="text-sm text-gray-900 dark:text-white">Show Poles</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showFieldLines"
              checked={showFieldLines}
              onCheckedChange={(checked) => onSetShowFieldLines(checked as boolean)}
            />
            <Label htmlFor="showFieldLines" className="text-sm text-gray-900 dark:text-white">Show Field Lines</Label>
          </div>
        </div>

        {poles.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">
            No poles yet. Use the controls above to add magnetic poles.
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
} 