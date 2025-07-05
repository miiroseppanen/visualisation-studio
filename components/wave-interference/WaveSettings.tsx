'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface WaveSettingsProps {
  resolution: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetResolution: (resolution: number) => void
}

export default function WaveSettings({
  resolution,
  expanded,
  onToggleExpanded,
  onSetResolution
}: WaveSettingsProps) {
  return (
    <CollapsibleSection
      title="Wave Settings"
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Resolution Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Pattern Resolution</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{resolution}px</span>
          </div>
          <Slider
            value={[resolution]}
            onValueChange={(value) => onSetResolution(value[0])}
            max={8}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Lower values create smoother patterns but may be slower
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
} 