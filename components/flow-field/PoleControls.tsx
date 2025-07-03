'use client'

import React from 'react'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface MagneticPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'north' | 'south'
}

interface PoleControlsProps {
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
}

export default function PoleControls({
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
  onSetShowFieldLines
}: PoleControlsProps) {
  return (
    <div>
      <button
        className="flex items-center w-full text-left"
        onClick={onToggleExpanded}
      >
        <ChevronRight 
          className={`w-4 h-4 mr-2 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <h3 className="text-base font-medium">Pole Management</h3>
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Pole Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pole Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={selectedPoleType === 'north' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSetSelectedPoleType('north')}
              >
                North
              </Button>
              <Button
                variant={selectedPoleType === 'south' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSetSelectedPoleType('south')}
              >
                South
              </Button>
            </div>
          </div>
          
          {/* Add Pole Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetIsAddingPole(!isAddingPole)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingPole ? 'Cancel' : 'Add Pole'}
          </Button>

          {/* Existing Poles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Poles</Label>
            {poles.map(pole => (
              <div key={pole.id} className="flex items-center space-x-2 p-2 border rounded">
                <div className={`w-3 h-3 rounded-full ${pole.type === 'north' ? 'bg-black' : 'bg-white border border-black'}`} />
                <span className="text-sm flex-1">{pole.type}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePole(pole.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Display Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPoles"
                checked={showPoles}
                onCheckedChange={(checked) => onSetShowPoles(checked as boolean)}
              />
              <Label htmlFor="showPoles" className="text-sm">Show Poles</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFieldLines"
                checked={showFieldLines}
                onCheckedChange={(checked) => onSetShowFieldLines(checked as boolean)}
              />
              <Label htmlFor="showFieldLines" className="text-sm">Show Field Lines</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 