'use client'

import React, { useCallback } from 'react'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import type { TurbulenceSettings } from '@/lib/types'
import {
  MIN_TURBULENCE_LINE_COUNT,
  MAX_TURBULENCE_LINE_COUNT,
  TURBULENCE_LINE_COUNT_STEP,
  MIN_TURBULENCE_LINE_LENGTH,
  MAX_TURBULENCE_LINE_LENGTH,
  TURBULENCE_LINE_LENGTH_STEP,
  MIN_STREAMLINE_STEPS,
  MAX_STREAMLINE_STEPS,
  STREAMLINE_STEPS_STEP,
  MIN_STREAMLINE_STEP_SIZE,
  MAX_STREAMLINE_STEP_SIZE,
  STREAMLINE_STEP_SIZE_STEP
} from '@/lib/constants'

interface TurbulenceSettingsProps {
  settings: TurbulenceSettings
  expanded: boolean
  onToggleExpanded: () => void
  onSettingsChange: (updates: Partial<TurbulenceSettings>) => void
}

export function TurbulenceSettings({ 
  settings, 
  expanded, 
  onToggleExpanded, 
  onSettingsChange 
}: TurbulenceSettingsProps) {
  const { t } = useTranslation()
  
  // Extract streamline settings for easier access
  const streamlineSteps = settings.streamlineSteps || 50
  const streamlineStepSize = settings.streamlineStepSize || 2

  // Convert to array format for sliders
  const lineCountValue = [settings.lineCount]
  const lineLengthValue = [settings.lineLength]
  const streamlineStepsValue = [streamlineSteps]
  const streamlineStepSizeValue = [streamlineStepSize]

  // Handlers for slider changes
  const handleLineCountChange = useCallback(([value]: number[]) => {
    if (value !== settings.lineCount) {
      onSettingsChange({ lineCount: value });
    }
  }, [settings.lineCount, onSettingsChange]);

  const handleLineLengthChange = useCallback(([value]: number[]) => {
    if (value !== settings.lineLength) {
      onSettingsChange({ lineLength: value });
    }
  }, [settings.lineLength, onSettingsChange]);

  const handleStreamlineStepsChange = useCallback(([value]: number[]) => {
    if (value !== streamlineSteps) {
      onSettingsChange({ streamlineSteps: value });
    }
  }, [streamlineSteps, onSettingsChange]);

  const handleStreamlineStepSizeChange = useCallback(([value]: number[]) => {
    if (value !== streamlineStepSize) {
      onSettingsChange({ streamlineStepSize: value });
    }
  }, [streamlineStepSize, onSettingsChange]);

  return (
    <div className="space-y-4">
      <CollapsibleHeader
        title={t('visualizationSettings.turbulenceSettings')}
        isExpanded={expanded}
        onToggle={onToggleExpanded}
      />

      {expanded && (
        <div className="space-y-4 pl-4">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('visualizationSettings.visualizationMode')}</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="streamlineMode"
                checked={settings.streamlineMode}
                onCheckedChange={(checked) => onSettingsChange({ streamlineMode: !!checked })}
              />
              <Label htmlFor="streamlineMode" className="text-sm">
                {t('visualizationSettings.streamlineMode')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSources"
                checked={settings.showSources}
                onCheckedChange={(checked) => onSettingsChange({ showSources: !!checked })}
              />
              <Label htmlFor="showSources" className="text-sm">
                {t('visualizationSettings.showSources')}
              </Label>
            </div>
          </div>

          {/* Line Count (for both modes) */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">
                {settings.streamlineMode ? t('visualizationSettings.streamlineDensity') : t('visualizationSettings.vectorDensity')}
              </Label>
              <span className="text-xs text-muted-foreground">
                {settings.lineCount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={lineCountValue}
              onValueChange={handleLineCountChange}
              min={MIN_TURBULENCE_LINE_COUNT}
              max={MAX_TURBULENCE_LINE_COUNT}
              step={TURBULENCE_LINE_COUNT_STEP}
              className="w-full"
            />
          </div>

          {/* Line Length (for vector mode) */}
          {!settings.streamlineMode && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">{t('visualizationSettings.vectorLength')}</Label>
                <span className="text-xs text-muted-foreground">
                  {settings.lineLength}px
                </span>
              </div>
              <Slider
                value={lineLengthValue}
                onValueChange={handleLineLengthChange}
                min={MIN_TURBULENCE_LINE_LENGTH}
                max={MAX_TURBULENCE_LINE_LENGTH}
                step={TURBULENCE_LINE_LENGTH_STEP}
                className="w-full"
              />
            </div>
          )}

          {/* Streamline Settings (for streamline mode) */}
          {settings.streamlineMode && (
            <>
              {/* Streamline Steps */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">{t('visualizationSettings.streamlineLength')}</Label>
                  <span className="text-xs text-muted-foreground">
                    {streamlineSteps} {t('visualizationSettings.steps')}
                  </span>
                </div>
                <Slider
                  value={streamlineStepsValue}
                  onValueChange={handleStreamlineStepsChange}
                  min={MIN_STREAMLINE_STEPS}
                  max={MAX_STREAMLINE_STEPS}
                  step={STREAMLINE_STEPS_STEP}
                  className="w-full"
                />
              </div>

              {/* Streamline Step Size */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">{t('visualizationSettings.stepSize')}</Label>
                  <span className="text-xs text-muted-foreground">
                    {streamlineStepSize}px
                  </span>
                </div>
                <Slider
                  value={streamlineStepSizeValue}
                  onValueChange={handleStreamlineStepSizeChange}
                  min={MIN_STREAMLINE_STEP_SIZE}
                  max={MAX_STREAMLINE_STEP_SIZE}
                  step={STREAMLINE_STEP_SIZE_STEP}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Show Sources */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSources"
              checked={settings.showSources}
              onCheckedChange={(checked) => onSettingsChange({ showSources: !!checked })}
            />
            <Label htmlFor="showSources" className="text-sm">
              {t('visualizationSettings.showSources')}
            </Label>
          </div>
        </div>
      )}
    </div>
  )
} 