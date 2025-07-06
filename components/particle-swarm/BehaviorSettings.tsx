'use client'

import React from 'react'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface BehaviorSettingsProps {
  flockStrength: number
  onFlockStrengthChange: (value: number) => void
  separationStrength: number
  onSeparationStrengthChange: (value: number) => void
  alignmentStrength: number
  onAlignmentStrengthChange: (value: number) => void
  attractionStrength: number
  onAttractionStrengthChange: (value: number) => void
  maxSpeed: number
  onMaxSpeedChange: (value: number) => void
  friction: number
  onFrictionChange: (value: number) => void
  isExpanded: boolean
  onToggleExpanded: (expanded: boolean) => void
}

export default function BehaviorSettings({
  flockStrength,
  onFlockStrengthChange,
  separationStrength,
  onSeparationStrengthChange,
  alignmentStrength,
  onAlignmentStrengthChange,
  attractionStrength,
  onAttractionStrengthChange,
  maxSpeed,
  onMaxSpeedChange,
  friction,
  onFrictionChange,
  isExpanded,
  onToggleExpanded
}: BehaviorSettingsProps) {
  return (
    <CollapsibleSection
      title="Behavior Settings"
      defaultOpen={isExpanded}
    >
      <div className="space-y-4">
        {/* Flocking Behavior */}
        <div className="space-y-2">
          <Label htmlFor="flock-strength">Flock Strength: {flockStrength.toFixed(2)}</Label>
          <Slider
            id="flock-strength"
            min={0}
            max={1}
            step={0.01}
            value={[flockStrength]}
            onValueChange={(value) => onFlockStrengthChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Separation Strength */}
        <div className="space-y-2">
          <Label htmlFor="separation-strength">Separation Strength: {separationStrength.toFixed(2)}</Label>
          <Slider
            id="separation-strength"
            min={0}
            max={2}
            step={0.01}
            value={[separationStrength]}
            onValueChange={(value) => onSeparationStrengthChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Alignment Strength */}
        <div className="space-y-2">
          <Label htmlFor="alignment-strength">Alignment Strength: {alignmentStrength.toFixed(2)}</Label>
          <Slider
            id="alignment-strength"
            min={0}
            max={1}
            step={0.01}
            value={[alignmentStrength]}
            onValueChange={(value) => onAlignmentStrengthChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Attraction Strength */}
        <div className="space-y-2">
          <Label htmlFor="attraction-strength">Attraction Strength: {attractionStrength.toFixed(2)}</Label>
          <Slider
            id="attraction-strength"
            min={0}
            max={1}
            step={0.01}
            value={[attractionStrength]}
            onValueChange={(value) => onAttractionStrengthChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Max Speed */}
        <div className="space-y-2">
          <Label htmlFor="max-speed">Max Speed: {maxSpeed.toFixed(1)}</Label>
          <Slider
            id="max-speed"
            min={0.5}
            max={5}
            step={0.1}
            value={[maxSpeed]}
            onValueChange={(value) => onMaxSpeedChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Friction */}
        <div className="space-y-2">
          <Label htmlFor="friction">Friction: {friction.toFixed(3)}</Label>
          <Slider
            id="friction"
            min={0.9}
            max={0.999}
            step={0.001}
            value={[friction]}
            onValueChange={(value) => onFrictionChange(value[0])}
            className="w-full"
          />
        </div>
      </div>
    </CollapsibleSection>
  )
} 