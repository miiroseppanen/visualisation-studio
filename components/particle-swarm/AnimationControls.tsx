'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { ParticleSwarmAnimationSettings } from '@/lib/types'

interface AnimationControlsProps {
  settings: ParticleSwarmAnimationSettings
  onSettingsChange: (updates: Partial<ParticleSwarmAnimationSettings>) => void
  onReset: () => void
  expanded: boolean
  onToggleExpanded: () => void
}

export default function AnimationControls({
  settings,
  onSettingsChange,
  onReset,
  expanded,
  onToggleExpanded
}: AnimationControlsProps) {
  return (
    <CollapsibleSection
      title="Animation Controls"
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Play/Pause Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSettingsChange({ isAnimating: !settings.isAnimating })}
          className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {settings.isAnimating ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause Animation
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play Animation
            </>
          )}
        </Button>

        {/* Animation Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">Animation Speed</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{settings.speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[settings.speed]}
            onValueChange={(value) => onSettingsChange({ speed: value[0] })}
            max={3}
            min={0.1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </CollapsibleSection>
  )
} 