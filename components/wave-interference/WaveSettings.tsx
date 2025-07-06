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
  interferenceStrength: number
  onInterferenceStrengthChange: (value: number) => void
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
  interferenceStrength,
  onInterferenceStrengthChange,
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

        {/* Interference Strength */}
        <div className="space-y-2">
          <Label htmlFor="interference-strength">{t('visualizationSettings.interferenceStrength')}: {interferenceStrength.toFixed(2)}</Label>
          <Slider
            id="interference-strength"
            min={0}
            max={2}
            step={0.01}
            value={[interferenceStrength]}
            onValueChange={(value) => onInterferenceStrengthChange(value[0])}
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