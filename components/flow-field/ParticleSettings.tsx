'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ParticleSettingsProps {
  particleCount: number
  particleSpeed: number
  particleLife: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetParticleCount: (count: number) => void
  onSetParticleSpeed: (speed: number) => void
  onSetParticleLife: (life: number) => void
}

export default function ParticleSettings({
  particleCount,
  particleSpeed,
  particleLife,
  expanded,
  onToggleExpanded,
  onSetParticleCount,
  onSetParticleSpeed,
  onSetParticleLife
}: ParticleSettingsProps) {
  return (
    <div>
      <button
        className="flex items-center w-full text-left"
        onClick={onToggleExpanded}
      >
        <ChevronRight 
          className={`w-4 h-4 mr-2 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <h3 className="text-base font-medium">Particle Settings</h3>
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Particle Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Particle Count</Label>
              <div className="text-sm text-muted-foreground">{particleCount}</div>
            </div>
            <Slider
              value={[particleCount]}
              onValueChange={([value]) => onSetParticleCount(value)}
              max={500}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          {/* Particle Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Particle Speed</Label>
              <div className="text-sm text-muted-foreground">{particleSpeed.toFixed(1)}</div>
            </div>
            <Slider
              value={[particleSpeed]}
              onValueChange={([value]) => onSetParticleSpeed(value)}
              max={10}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Particle Life */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Particle Life</Label>
              <div className="text-sm text-muted-foreground">{particleLife}</div>
            </div>
            <Slider
              value={[particleLife]}
              onValueChange={([value]) => onSetParticleLife(value)}
              max={200}
              min={20}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
} 