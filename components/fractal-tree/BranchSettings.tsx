'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface BranchSettingsProps {
  branchAngle: number
  lengthRatio: number
  angleVariation: number
  thicknessRatio: number
  baseThickness: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetBranchAngle: (angle: number) => void
  onSetLengthRatio: (ratio: number) => void
  onSetAngleVariation: (variation: number) => void
  onSetThicknessRatio: (ratio: number) => void
  onSetBaseThickness: (thickness: number) => void
}

export default function BranchSettings({
  branchAngle,
  lengthRatio,
  angleVariation,
  thicknessRatio,
  baseThickness,
  expanded,
  onToggleExpanded,
  onSetBranchAngle,
  onSetLengthRatio,
  onSetAngleVariation,
  onSetThicknessRatio,
  onSetBaseThickness
}: BranchSettingsProps) {
  return (
    <CollapsibleSection
      title="Branch Settings"
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Branch Angle */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Branch Angle</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{branchAngle}°</span>
          </div>
          <Slider
            value={[branchAngle]}
            onValueChange={(value) => onSetBranchAngle(value[0])}
            max={60}
            min={10}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Angle between left and right branches
          </p>
        </div>

        {/* Length Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Length Ratio</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{lengthRatio.toFixed(2)}</span>
          </div>
          <Slider
            value={[lengthRatio]}
            onValueChange={(value) => onSetLengthRatio(value[0])}
            max={1}
            min={0.3}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How much shorter child branches are
          </p>
        </div>

        {/* Angle Variation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Angle Variation</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{angleVariation}°</span>
          </div>
          <Slider
            value={[angleVariation]}
            onValueChange={(value) => onSetAngleVariation(value[0])}
            max={30}
            min={0}
            step={2}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Random variation in branch angles
          </p>
        </div>

        {/* Thickness Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Thickness Ratio</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{thicknessRatio.toFixed(2)}</span>
          </div>
          <Slider
            value={[thicknessRatio]}
            onValueChange={(value) => onSetThicknessRatio(value[0])}
            max={1}
            min={0.3}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            How much thinner child branches are
          </p>
        </div>

        {/* Base Thickness */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Base Thickness</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{baseThickness}</span>
          </div>
          <Slider
            value={[baseThickness]}
            onValueChange={(value) => onSetBaseThickness(value[0])}
            max={20}
            min={2}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Thickness of the main trunk
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
} 