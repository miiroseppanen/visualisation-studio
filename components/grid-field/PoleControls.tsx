"use client"

import React from 'react'
import PoleControls from '@/components/ui/pole-controls'
import type { Pole, PolaritySettings } from '@/lib/types'

interface GridPoleControlsProps {
  poles: Pole[]
  polaritySettings: PolaritySettings
  showPoles: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetPoles: (poles: Pole[]) => void
  onUpdatePolarity: (updates: Partial<PolaritySettings>) => void
  onToggleShowPoles: (show: boolean) => void
}

export default function GridPoleControls({
  poles,
  polaritySettings,
  showPoles,
  expanded,
  onToggleExpanded,
  onSetPoles,
  onUpdatePolarity,
  onToggleShowPoles
}: GridPoleControlsProps) {
  return (
    <PoleControls
      poles={poles}
      polaritySettings={polaritySettings}
      showPoles={showPoles}
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      onSetPoles={onSetPoles}
      onUpdatePolarity={onUpdatePolarity}
      onToggleShowPoles={onToggleShowPoles}
      addButtonPosition="outside"
      showPolarityControls={true}
      showGlobalControls={true}
    />
  )
} 