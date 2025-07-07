'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { useTranslation } from 'react-i18next'

interface WaveSettingsProps {
  showWaveFunctions: boolean
  onShowWaveFunctionsChange: (value: boolean) => void
  showInterference: boolean
  onShowInterferenceChange: (value: boolean) => void
  showCollapse: boolean
  onShowCollapseChange: (value: boolean) => void
  fieldDensity: number
  onFieldDensityChange: (value: number) => void
  interferenceContrast: number
  onInterferenceContrastChange: (value: number) => void
  resolution: number
  onSetResolution: (value: number) => void
  lineDensity: number
  onSetLineDensity: (value: number) => void
  expanded: boolean
  onToggleExpanded: () => void
}

export default function WaveSettings({
  showWaveFunctions,
  onShowWaveFunctionsChange,
  showInterference,
  onShowInterferenceChange,
  showCollapse,
  onShowCollapseChange,
  fieldDensity,
  onFieldDensityChange,
  interferenceContrast,
  onInterferenceContrastChange,
  resolution,
  onSetResolution,
  lineDensity,
  onSetLineDensity,
  expanded,
  onToggleExpanded
}: WaveSettingsProps) {
  const { t } = useTranslation()
  
  return (
    <CollapsibleSection
      title={t('visualizationSettings.waveSettings')}
      defaultOpen={expanded}
    >
      <div className="space-y-4">
        {/* Field Density */}
        <div className="space-y-2">
          <Label htmlFor="field-density">{t('visualizationSettings.fieldDensity')}: {fieldDensity}</Label>
          <Slider
            id="field-density"
            min={10}
            max={40}
            step={1}
            value={[fieldDensity]}
            onValueChange={(value) => onFieldDensityChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Interference Contrast */}
        <div className="space-y-2">
          <Label htmlFor="interference-contrast">{t('visualizationSettings.interferenceContrast')}: {interferenceContrast.toFixed(2)}</Label>
          <Slider
            id="interference-contrast"
            min={0}
            max={2}
            step={0.01}
            value={[interferenceContrast]}
            onValueChange={(value) => onInterferenceContrastChange(value[0])}
            className="w-full"
          />
        </div>

        {/* Resolution */}
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution: {resolution}</Label>
          <Slider
            id="resolution"
            min={4}
            max={20}
            step={1}
            value={[resolution]}
            onValueChange={(value) => onSetResolution(value[0])}
            className="w-full"
          />
        </div>

        {/* Line Density */}
        <div className="space-y-2">
          <Label htmlFor="line-density">Line Density: {lineDensity}</Label>
          <Slider
            id="line-density"
            min={4}
            max={16}
            step={1}
            value={[lineDensity]}
            onValueChange={(value) => onSetLineDensity(value[0])}
            className="w-full"
          />
        </div>

        {/* Visibility Toggles */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-wave-functions"
              checked={showWaveFunctions}
              onCheckedChange={onShowWaveFunctionsChange}
            />
            <Label htmlFor="show-wave-functions">{t('visualizationSettings.showWaveFunctions')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-interference"
              checked={showInterference}
              onCheckedChange={onShowInterferenceChange}
            />
            <Label htmlFor="show-interference">{t('visualizationSettings.showInterference')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-collapse"
              checked={showCollapse}
              onCheckedChange={onShowCollapseChange}
            />
            <Label htmlFor="show-collapse">{t('visualizationSettings.showCollapse')}</Label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
} 