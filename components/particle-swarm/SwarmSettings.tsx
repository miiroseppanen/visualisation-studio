'use client'

import React from 'react'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface SwarmSettingsProps {
  particleCount: number
  onParticleCountChange: (value: number) => void
  particleSize: number
  onParticleSizeChange: (value: number) => void
  showParticles: boolean
  onShowParticlesChange: (value: boolean) => void
  showAttractors: boolean
  onShowAttractorsChange: (value: boolean) => void
  showTrails: boolean
  onShowTrailsChange: (value: boolean) => void
  showConnections: boolean
  onShowConnectionsChange: (value: boolean) => void
  trailLength: number
  onTrailLengthChange: (value: number) => void
  connectionDistance: number
  onConnectionDistanceChange: (value: number) => void
  isExpanded: boolean
  onToggleExpanded: (expanded: boolean) => void
}

export default function SwarmSettings({
  particleCount,
  onParticleCountChange,
  particleSize,
  onParticleSizeChange,
  showParticles,
  onShowParticlesChange,
  showAttractors,
  onShowAttractorsChange,
  showTrails,
  onShowTrailsChange,
  showConnections,
  onShowConnectionsChange,
  trailLength,
  onTrailLengthChange,
  connectionDistance,
  onConnectionDistanceChange,
  isExpanded,
  onToggleExpanded
}: SwarmSettingsProps) {
  return (
    <CollapsibleSection
      title="Swarm Settings"
      defaultOpen={isExpanded}
    >
      <div className="space-y-4">
        {/* Particle Count */}
        <div className="space-y-2">
          <Label htmlFor="particle-count">Particle Count: {particleCount}</Label>
          <Slider
            id="particle-count"
            min={50}
            max={500}
            step={10}
            value={[particleCount]}
            onValueChange={(value) => onParticleCountChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Particle Size */}
        <div className="space-y-2">
          <Label htmlFor="particle-size">Particle Size: {particleSize}</Label>
          <Slider
            id="particle-size"
            min={1}
            max={8}
            step={0.5}
            value={[particleSize]}
            onValueChange={(value) => onParticleSizeChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Connection Distance */}
        <div className="space-y-2">
          <Label htmlFor="connection-distance">Connection Distance: {connectionDistance}</Label>
          <Slider
            id="connection-distance"
            min={20}
            max={150}
            step={5}
            value={[connectionDistance]}
            onValueChange={(value) => onConnectionDistanceChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Trail Length */}
        <div className="space-y-2">
          <Label htmlFor="trail-length">Trail Length: {trailLength}</Label>
          <Slider
            id="trail-length"
            min={5}
            max={50}
            step={1}
            value={[trailLength]}
            onValueChange={(value) => onTrailLengthChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Visibility Toggles */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-particles"
              checked={showParticles}
              onCheckedChange={onShowParticlesChange}
            />
            <Label htmlFor="show-particles">Show Particles</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-attractors"
              checked={showAttractors}
              onCheckedChange={onShowAttractorsChange}
            />
            <Label htmlFor="show-attractors">Show Attractors</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-trails"
              checked={showTrails}
              onCheckedChange={onShowTrailsChange}
            />
            <Label htmlFor="show-trails">Show Trails</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-connections"
              checked={showConnections}
              onCheckedChange={onShowConnectionsChange}
            />
            <Label htmlFor="show-connections">Show Connections</Label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
} 