'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { useTranslation } from 'react-i18next'

interface WaveSettingsProps {
  resolution: number
  lineDensity: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetResolution: (resolution: number) => void
  onSetLineDensity: (lineDensity: number) => void
}

export default function WaveSettings({
  resolution,
  lineDensity,
  expanded,
  onToggleExpanded,
  onSetResolution,
  onSetLineDensity
}: WaveSettingsProps) {
  const { t } = useTranslation()
  
  return (
    <CollapsibleSection
      title={t('visualizationSettings.waveSettings')}
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Smoothness Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.smoothness')}</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{resolution}</span>
          </div>
          <Slider
            value={[resolution]}
            onValueChange={(value) => onSetResolution(value[0])}
            max={20}
            min={2}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {t('visualizationSettings.smoothnessDescription')}
          </p>
        </div>

        {/* Line Density Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.lineDensity')}</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{lineDensity}</span>
          </div>
          <Slider
            value={[lineDensity]}
            onValueChange={(value) => onSetLineDensity(value[0])}
            max={20}
            min={2}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {t('visualizationSettings.lineDensityDescription')}
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
} 