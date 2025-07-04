"use client"

import React from 'react'
import PoleControls from '@/components/ui/pole-controls'
import type { Pole } from '@/lib/types'

interface CircularPoleControlsProps {
  poles: Pole[]
  onPoleUpdate: (id: string, updates: Partial<Pole>) => void
  onPoleRemove: (id: string) => void
  isExpanded: boolean
  onToggle: () => void
}

export function CircularPoleControls({ 
  poles, 
  onPoleUpdate, 
  onPoleRemove, 
  isExpanded, 
  onToggle 
}: CircularPoleControlsProps) {
  // Convert the circular field's pole update functions to work with the unified component
  const onSetPoles = (newPoles: Pole[]) => {
    // For circular field, we need to handle individual updates
    // This is a simplified approach - in practice, you might want to refactor the circular field logic
    newPoles.forEach((newPole, index) => {
      const existingPole = poles[index]
      if (existingPole && (newPole.strength !== existingPole.strength || newPole.isPositive !== existingPole.isPositive)) {
        onPoleUpdate(existingPole.id, {
          strength: newPole.strength,
          isPositive: newPole.isPositive
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-600 mb-2">
        Double-click on canvas to add poles
      </div>
      
      <PoleControls
        poles={poles}
        expanded={isExpanded}
        onToggleExpanded={onToggle}
        onSetPoles={onSetPoles}
        addButtonPosition="inside"
        showPolarityControls={true}
        showGlobalControls={false}
      />
    </div>
  )
} 