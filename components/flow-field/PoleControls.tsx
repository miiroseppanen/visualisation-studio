'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Plus, Magnet, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import type { Pole } from '@/lib/types'
import type { FlowFieldPanelState } from '@/lib/types'
import { COLOR_PALETTE } from '@/lib/constants'

interface MagneticPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'north' | 'south'
}

interface FlowPoleControlsProps {
  poles: MagneticPole[]
  selectedPoleType: 'north' | 'south'
  isAddingPole: boolean
  showPoles: boolean
  showFieldLines: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetSelectedPoleType: (type: 'north' | 'south') => void
  onSetIsAddingPole: (adding: boolean) => void
  onRemovePole: (id: string) => void
  onSetShowPoles: (show: boolean) => void
  onSetShowFieldLines: (show: boolean) => void
  onUpdatePole?: (id: string, updates: Partial<MagneticPole>) => void
}

export default function FlowPoleControls({
  poles,
  selectedPoleType,
  isAddingPole,
  showPoles,
  showFieldLines,
  expanded,
  onToggleExpanded,
  onSetSelectedPoleType,
  onSetIsAddingPole,
  onRemovePole,
  onSetShowPoles,
  onSetShowFieldLines,
  onUpdatePole
}: FlowPoleControlsProps) {
  const poleTypeOptions = [
    {
      value: 'north',
      label: 'North',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.positive // Red for north
    },
    {
      value: 'south',
      label: 'South',
      icon: <Magnet className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.negative // Blue for south
    }
  ]

  const switchPoleType = (id: string, newType: string) => {
    if (onUpdatePole) {
      onUpdatePole(id, { type: newType as 'north' | 'south' })
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
              <div className="flex space-x-2">
                <Button
                  variant={selectedPoleType === 'north' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('north')}
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  North
                </Button>
                <Button
                  variant={selectedPoleType === 'south' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedPoleType('south')}
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Magnet className="w-3 h-3 mr-1" />
                  South
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Poles */}
        {poles.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">Current Poles</Label>
            {poles.map(pole => (
              <ListCard
                key={pole.id}
                icon={<Magnet className="w-8 h-8 text-white" />}
                iconColor={pole.type === 'north' ? COLOR_PALETTE.positive : COLOR_PALETTE.negative}
                title={pole.type}
                subtitle={`Strength: ${pole.strength} • Position: (${Math.round(pole.x)}, ${Math.round(pole.y)})`}
                onRemove={() => onRemovePole(pole.id)}
                typeOptions={poleTypeOptions}
                currentType={pole.type}
                onTypeChange={(newType) => switchPoleType(pole.id, newType)}
                showTypeSwitch={!!onUpdatePole}
              />
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