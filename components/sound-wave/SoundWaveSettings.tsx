'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Settings, Eye } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface SoundWaveSettingsProps {
  waveType: 'sine' | 'square' | 'sawtooth' | 'triangle'
  baseFrequency: number
  harmonics: number
  noiseLevel: number
  showWaveform: boolean
  showSpectrum: boolean
  showHarmonics: boolean
  waveformStyle: 'line' | 'bars' | 'circles'
  expanded: boolean
  onToggleExpanded: () => void
  onSetWaveType: (type: 'sine' | 'square' | 'sawtooth' | 'triangle') => void
  onSetBaseFrequency: (freq: number) => void
  onSetHarmonics: (harmonics: number) => void
  onSetNoiseLevel: (level: number) => void
  onSetShowWaveform: (show: boolean) => void
  onSetShowSpectrum: (show: boolean) => void
  onSetShowHarmonics: (show: boolean) => void
  onSetWaveformStyle: (style: 'line' | 'bars' | 'circles') => void
}

export default function SoundWaveSettings({
  waveType,
  baseFrequency,
  harmonics,
  noiseLevel,
  showWaveform,
  showSpectrum,
  showHarmonics,
  waveformStyle,
  expanded,
  onToggleExpanded,
  onSetWaveType,
  onSetBaseFrequency,
  onSetHarmonics,
  onSetNoiseLevel,
  onSetShowWaveform,
  onSetShowSpectrum,
  onSetShowHarmonics,
  onSetWaveformStyle
}: SoundWaveSettingsProps) {
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
        <Settings className="h-4 w-4" />
        Wave Settings
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Wave Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Wave Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={waveType === 'sine' ? "default" : "outline"}
                size="sm"
                onClick={() => onSetWaveType('sine')}
              >
                Sine
              </Button>
              <Button
                variant={waveType === 'square' ? "default" : "outline"}
                size="sm"
                onClick={() => onSetWaveType('square')}
              >
                Square
              </Button>
              <Button
                variant={waveType === 'sawtooth' ? "default" : "outline"}
                size="sm"
                onClick={() => onSetWaveType('sawtooth')}
              >
                Sawtooth
              </Button>
              <Button
                variant={waveType === 'triangle' ? "default" : "outline"}
                size="sm"
                onClick={() => onSetWaveType('triangle')}
              >
                Triangle
              </Button>
            </div>
          </div>

          {/* Base Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Base Frequency</Label>
              <div className="text-sm text-muted-foreground">{baseFrequency}Hz</div>
            </div>
            <Slider
              value={[baseFrequency]}
              onValueChange={([value]) => onSetBaseFrequency(value)}
              max={2000}
              min={20}
              step={10}
              className="w-full"
            />
          </div>

          {/* Harmonics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Harmonics</Label>
              <div className="text-sm text-muted-foreground">{harmonics}</div>
            </div>
            <Slider
              value={[harmonics]}
              onValueChange={([value]) => onSetHarmonics(value)}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Noise Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Noise Level</Label>
              <div className="text-sm text-muted-foreground">{Math.round(noiseLevel * 100)}%</div>
            </div>
            <Slider
              value={[noiseLevel]}
              onValueChange={([value]) => onSetNoiseLevel(value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Display Settings */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Display Settings</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-waveform"
                checked={showWaveform}
                onCheckedChange={onSetShowWaveform}
              />
              <Label htmlFor="show-waveform" className="text-sm">Show Waveform</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-spectrum"
                checked={showSpectrum}
                onCheckedChange={onSetShowSpectrum}
              />
              <Label htmlFor="show-spectrum" className="text-sm">Show Spectrum</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-harmonics"
                checked={showHarmonics}
                onCheckedChange={onSetShowHarmonics}
              />
              <Label htmlFor="show-harmonics" className="text-sm">Show Harmonics</Label>
            </div>

            {/* Waveform Style */}
            <div className="space-y-2">
              <Label className="text-sm">Waveform Style</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={waveformStyle === 'line' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetWaveformStyle('line')}
                >
                  Line
                </Button>
                <Button
                  variant={waveformStyle === 'bars' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetWaveformStyle('bars')}
                >
                  Bars
                </Button>
                <Button
                  variant={waveformStyle === 'circles' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetWaveformStyle('circles')}
                >
                  Circles
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 