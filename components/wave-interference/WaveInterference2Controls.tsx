'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface WaveInterference2ControlsProps {
  showHarmonics: boolean
  harmonicIntensity: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetShowHarmonics: (show: boolean) => void
  onSetHarmonicIntensity: (intensity: number) => void
}

export default function WaveInterference2Controls({
  showHarmonics,
  harmonicIntensity,
  expanded,
  onToggleExpanded,
  onSetShowHarmonics,
  onSetHarmonicIntensity
}: WaveInterference2ControlsProps) {
  return (
    <Card>
      <CollapsibleSection
        title="Advanced Wave Settings"
        defaultOpen={expanded}
      >
        <CardContent className="space-y-6">
          {/* Harmonics Display Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-harmonics" className="text-sm font-medium">
                Show Harmonics
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetShowHarmonics(!showHarmonics)}
                className="h-8 px-3"
              >
                {showHarmonics ? 'On' : 'Off'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Display harmonic patterns in the interference field
            </p>
          </div>

          {/* Harmonic Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="harmonic-intensity" className="text-sm font-medium">
                Harmonic Intensity
              </Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(harmonicIntensity * 100)}%
              </span>
            </div>
            <Slider
              id="harmonic-intensity"
              min={0}
              max={1}
              step={0.01}
              value={[harmonicIntensity]}
              onValueChange={(value) => onSetHarmonicIntensity(value[0])}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Control the strength of harmonic components in wave calculations
            </p>
          </div>

          {/* Wave Type Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Wave Types</Label>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <strong>Sine:</strong> Smooth, continuous wave
              </div>
              <div>
                <strong>Cosine:</strong> Phase-shifted sine wave
              </div>
              <div>
                <strong>Square:</strong> Sharp transitions, rich harmonics
              </div>
              <div>
                <strong>Triangle:</strong> Linear ramps, moderate harmonics
              </div>
              <div>
                <strong>Sawtooth:</strong> Asymmetric, complex harmonics
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Different wave types create unique interference patterns. 
              Square and sawtooth waves produce more complex harmonics, while sine waves 
              create smoother patterns. Try combining different wave types for interesting effects.
            </p>
          </div>
        </CardContent>
      </CollapsibleSection>
    </Card>
  )
} 