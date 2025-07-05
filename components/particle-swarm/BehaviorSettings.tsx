'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface BehaviorSettingsProps {
  cohesionStrength: number
  separationStrength: number
  alignmentStrength: number
  attractionStrength: number
  maxSpeed: number
  perceptionRadius: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetCohesionStrength: (strength: number) => void
  onSetSeparationStrength: (strength: number) => void
  onSetAlignmentStrength: (strength: number) => void
  onSetAttractionStrength: (strength: number) => void
  onSetMaxSpeed: (speed: number) => void
  onSetPerceptionRadius: (radius: number) => void
}

export default function BehaviorSettings({
  cohesionStrength,
  separationStrength,
  alignmentStrength,
  attractionStrength,
  maxSpeed,
  perceptionRadius,
  expanded,
  onToggleExpanded,
  onSetCohesionStrength,
  onSetSeparationStrength,
  onSetAlignmentStrength,
  onSetAttractionStrength,
  onSetMaxSpeed,
  onSetPerceptionRadius
}: BehaviorSettingsProps) {
  return (
    <CollapsibleSection
      title="Behavior Settings"
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Cohesion Strength */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Cohesion Strength</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{cohesionStrength.toFixed(1)}</span>
          </div>
          <Slider
            value={[cohesionStrength]}
            onValueChange={(value) => onSetCohesionStrength(value[0])}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How strongly particles move toward the center of their neighbors
          </p>
        </div>

        {/* Separation Strength */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Separation Strength</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{separationStrength.toFixed(1)}</span>
          </div>
          <Slider
            value={[separationStrength]}
            onValueChange={(value) => onSetSeparationStrength(value[0])}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How strongly particles avoid crowding each other
          </p>
        </div>

        {/* Alignment Strength */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Alignment Strength</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{alignmentStrength.toFixed(1)}</span>
          </div>
          <Slider
            value={[alignmentStrength]}
            onValueChange={(value) => onSetAlignmentStrength(value[0])}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How strongly particles match the velocity of their neighbors
          </p>
        </div>

        {/* Attraction Strength */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Attraction Strength</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{attractionStrength.toFixed(1)}</span>
          </div>
          <Slider
            value={[attractionStrength]}
            onValueChange={(value) => onSetAttractionStrength(value[0])}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How strongly particles are affected by attractors
          </p>
        </div>

        {/* Max Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Max Speed</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{maxSpeed.toFixed(1)}</span>
          </div>
          <Slider
            value={[maxSpeed]}
            onValueChange={(value) => onSetMaxSpeed(value[0])}
            max={10}
            min={1}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Perception Radius */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Perception Radius</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{perceptionRadius}</span>
          </div>
          <Slider
            value={[perceptionRadius]}
            onValueChange={(value) => onSetPerceptionRadius(value[0])}
            max={100}
            min={10}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How far particles can see their neighbors
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
} 