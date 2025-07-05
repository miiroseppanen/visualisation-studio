'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'

interface ParticleSettingsProps {
  particleCount: number
  particleSpeed: number
  particleLife: number
  showParticleTrails: boolean
  fieldLineDensity: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetParticleCount: (count: number) => void
  onSetParticleSpeed: (speed: number) => void
  onSetParticleLife: (life: number) => void
  onSetShowParticleTrails: (show: boolean) => void
  onSetFieldLineDensity: (density: number) => void
}

export default function ParticleSettings({
  particleCount,
  particleSpeed,
  particleLife,
  showParticleTrails,
  fieldLineDensity,
  expanded,
  onToggleExpanded,
  onSetParticleCount,
  onSetParticleSpeed,
  onSetParticleLife,
  onSetShowParticleTrails,
  onSetFieldLineDensity
}: ParticleSettingsProps) {
  return (
    <div>
      <button
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
        onClick={onToggleExpanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Particle Settings
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

          {/* Visual Effects */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Visual Effects</Label>
            
            {/* Particle Trails */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="particle-trails"
                checked={showParticleTrails}
                onCheckedChange={onSetShowParticleTrails}
              />
              <Label htmlFor="particle-trails" className="text-sm">Show Particle Trails</Label>
            </div>

            {/* Field Line Density */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Field Line Density</Label>
                <div className="text-sm text-muted-foreground">{fieldLineDensity}</div>
              </div>
              <Slider
                value={[fieldLineDensity]}
                onValueChange={([value]) => onSetFieldLineDensity(value)}
                max={30}
                min={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 