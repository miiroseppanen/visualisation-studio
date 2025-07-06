'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface QuantumControlsProps {
  showEntanglement: boolean
  onShowEntanglementChange: (value: boolean) => void
  showChaos: boolean
  onShowChaosChange: (value: boolean) => void
  collapseThreshold: number
  onCollapseThresholdChange: (value: number) => void
  chaosLevel: number
  onChaosLevelChange: (value: number) => void
  expanded: boolean
  onToggleExpanded: () => void
}

export default function QuantumControls({
  showEntanglement,
  onShowEntanglementChange,
  showChaos,
  onShowChaosChange,
  collapseThreshold,
  onCollapseThresholdChange,
  chaosLevel,
  onChaosLevelChange,
  expanded,
  onToggleExpanded
}: QuantumControlsProps) {
  return (
    <CollapsibleSection
      title="Quantum Effects"
      defaultOpen={expanded}
    >
      <div className="space-y-4">
        {/* Collapse Threshold */}
        <div className="space-y-2">
          <Label htmlFor="collapse-threshold">Collapse Threshold: {collapseThreshold.toFixed(2)}</Label>
          <Slider
            id="collapse-threshold"
            min={0.1}
            max={1}
            step={0.05}
            value={[collapseThreshold]}
            onValueChange={(value) => onCollapseThresholdChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Chaos Level */}
        <div className="space-y-2">
          <Label htmlFor="chaos-level">Chaos Level: {chaosLevel.toFixed(2)}</Label>
          <Slider
            id="chaos-level"
            min={0}
            max={1}
            step={0.01}
            value={[chaosLevel]}
            onValueChange={(value) => onChaosLevelChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Visibility Toggles */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-entanglement"
              checked={showEntanglement}
              onCheckedChange={onShowEntanglementChange}
            />
            <Label htmlFor="show-entanglement">Show Entanglement</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-chaos"
              checked={showChaos}
              onCheckedChange={onShowChaosChange}
            />
            <Label htmlFor="show-chaos">Show Chaos Effects</Label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
} 