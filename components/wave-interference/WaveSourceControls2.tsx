'use client'

import React from 'react'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface WaveSourceControls2Props {
  particleCount: number
  onParticleCountChange: (value: number) => void
  deviceCount: number
  onDeviceCountChange: (value: number) => void
  showParticles: boolean
  onShowParticlesChange: (value: boolean) => void
  showMeasurementDevices: boolean
  onShowMeasurementDevicesChange: (value: boolean) => void
  expanded: boolean
  onToggleExpanded: () => void
}

export default function WaveSourceControls2({
  particleCount,
  onParticleCountChange,
  deviceCount,
  onDeviceCountChange,
  showParticles,
  onShowParticlesChange,
  showMeasurementDevices,
  onShowMeasurementDevicesChange,
  expanded,
  onToggleExpanded
}: WaveSourceControls2Props) {
  return (
    <CollapsibleSection
      title="Quantum System"
      defaultOpen={expanded}
    >
      <div className="space-y-4">
        {/* Particle Count */}
        <div className="space-y-2">
          <Label htmlFor="particle-count">Particle Count: {particleCount}</Label>
          <Slider
            id="particle-count"
            min={5}
            max={30}
            step={1}
            value={[particleCount]}
            onValueChange={(value) => onParticleCountChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Device Count */}
        <div className="space-y-2">
          <Label htmlFor="device-count">Measurement Devices: {deviceCount}</Label>
          <Slider
            id="device-count"
            min={3}
            max={15}
            step={1}
            value={[deviceCount]}
            onValueChange={(value) => onDeviceCountChange(value[0])}
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
              id="show-devices"
              checked={showMeasurementDevices}
              onCheckedChange={onShowMeasurementDevicesChange}
            />
            <Label htmlFor="show-devices">Show Measurement Devices</Label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
} 