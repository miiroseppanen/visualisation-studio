'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'

interface MathematicalLinesSettings {
  lineCount: number
  lineLength: number
  fadeSpeed: number
  generationFrequency: number
  harmonicIntensity: number
  fractalIntensity: number
  spiralIntensity: number
  mouseInfluence: number
  colorMode: 'theme' | 'rainbow' | 'monochrome'
  lineWidth: number
  isAnimating: boolean
}

interface MathematicalLinesSettingsProps {
  settings: MathematicalLinesSettings
  onUpdateSettings: (updates: Partial<MathematicalLinesSettings>) => void
}

export default function MathematicalLinesSettings({
  settings,
  onUpdateSettings
}: MathematicalLinesSettingsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Line Properties */}
      <CollapsibleSection
        title={<span className="truncate">Line Properties</span>}
        defaultOpen={true}
      >
        <div className="space-y-6 mt-4">
          {/* Line Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Line Count</Label>
              <div className="text-sm text-muted-foreground">{settings.lineCount}</div>
            </div>
            <Slider
              value={[settings.lineCount]}
              onValueChange={([value]) => onUpdateSettings({ lineCount: value })}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
          </div>

          {/* Line Length */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Line Length</Label>
              <div className="text-sm text-muted-foreground">{settings.lineLength}px</div>
            </div>
            <Slider
              value={[settings.lineLength]}
              onValueChange={([value]) => onUpdateSettings({ lineLength: value })}
              max={120}
              min={20}
              step={5}
              className="w-full"
            />
          </div>

          {/* Line Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Line Width</Label>
              <div className="text-sm text-muted-foreground">{settings.lineWidth}</div>
            </div>
            <Slider
              value={[settings.lineWidth]}
              onValueChange={([value]) => onUpdateSettings({ lineWidth: value })}
              max={3}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Fade Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fade Speed</Label>
              <div className="text-sm text-muted-foreground">{settings.fadeSpeed.toFixed(3)}</div>
            </div>
            <Slider
              value={[settings.fadeSpeed * 1000]}
              onValueChange={([value]) => onUpdateSettings({ fadeSpeed: value / 1000 })}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Generation Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Generation Frequency</Label>
              <div className="text-sm text-muted-foreground">{settings.generationFrequency}</div>
            </div>
            <Slider
              value={[settings.generationFrequency]}
              onValueChange={([value]) => onUpdateSettings({ generationFrequency: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Function Intensities */}
      <CollapsibleSection
        title={<span className="truncate">Function Intensities</span>}
        defaultOpen={true}
      >
        <div className="space-y-6 mt-4">
          {/* Harmonic Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Harmonic</Label>
              <div className="text-sm text-muted-foreground">{settings.harmonicIntensity}</div>
            </div>
            <Slider
              value={[settings.harmonicIntensity]}
              onValueChange={([value]) => onUpdateSettings({ harmonicIntensity: value })}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Fractal Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fractal</Label>
              <div className="text-sm text-muted-foreground">{settings.fractalIntensity}</div>
            </div>
            <Slider
              value={[settings.fractalIntensity]}
              onValueChange={([value]) => onUpdateSettings({ fractalIntensity: value })}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Spiral Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Spiral</Label>
              <div className="text-sm text-muted-foreground">{settings.spiralIntensity}</div>
            </div>
            <Slider
              value={[settings.spiralIntensity]}
              onValueChange={([value]) => onUpdateSettings({ spiralIntensity: value })}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Mouse Influence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Mouse Influence</Label>
              <div className="text-sm text-muted-foreground">{settings.mouseInfluence}</div>
            </div>
            <Slider
              value={[settings.mouseInfluence]}
              onValueChange={([value]) => onUpdateSettings({ mouseInfluence: value })}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Appearance */}
      <CollapsibleSection
        title={<span className="truncate">Appearance</span>}
        defaultOpen={false}
      >
        <div className="space-y-6 mt-4">
          {/* Colour Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Colour Mode</Label>
            <div className="space-y-2">
              {(['theme', 'rainbow', 'monochrome'] as const).map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`color-${mode}`}
                    name="colorMode"
                    value={mode}
                    checked={settings.colorMode === mode}
                    onChange={(e) => onUpdateSettings({ colorMode: e.target.value as any })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`color-${mode}`} className="text-sm capitalize cursor-pointer">
                    {mode}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Animation Toggle */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="animation-toggle"
              checked={settings.isAnimating}
              onCheckedChange={(checked) => onUpdateSettings({ isAnimating: checked as boolean })}
            />
            <Label htmlFor="animation-toggle" className="text-sm cursor-pointer">
              Animate
            </Label>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
} 