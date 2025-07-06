'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Plus, Radio, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import { COLOR_PALETTE } from '@/lib/constants'
import { useTranslation } from 'react-i18next'

interface WaveSource {
  id: string
  x: number
  y: number
  frequency: number
  amplitude: number
  phase: number
  wavelength: number
  active: boolean
}

interface WaveSourceControlsProps {
  waveSources: WaveSource[]
  selectedSourceType: 'sine' | 'cosine'
  isAddingSource: boolean
  showWaveSources: boolean
  showInterference: boolean
  showWavefronts: boolean
  showCircles: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetSelectedSourceType: (type: 'sine' | 'cosine') => void
  onSetIsAddingSource: (adding: boolean) => void
  onRemoveSource: (id: string) => void
  onSetShowWaveSources: (show: boolean) => void
  onSetShowInterference: (show: boolean) => void
  onSetShowWavefronts: (show: boolean) => void
  onSetShowCircles: (show: boolean) => void
  onUpdateSource?: (id: string, updates: Partial<WaveSource>) => void
}

export default function WaveSourceControls({
  waveSources,
  selectedSourceType,
  isAddingSource,
  showWaveSources,
  showInterference,
  showWavefronts,
  showCircles,
  expanded,
  onToggleExpanded,
  onSetSelectedSourceType,
  onSetIsAddingSource,
  onRemoveSource,
  onSetShowWaveSources,
  onSetShowInterference,
  onSetShowWavefronts,
  onSetShowCircles,
  onUpdateSource
}: WaveSourceControlsProps) {
  const { t } = useTranslation()
  
  const sourceTypeOptions = [
    {
      value: 'sine',
      label: t('visualizationSettings.sineWave'),
      icon: <Radio className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.positive
    },
    {
      value: 'cosine',
      label: t('visualizationSettings.cosineWave'),
      icon: <Radio className="w-4 h-4 text-white" />,
      color: COLOR_PALETTE.negative
    }
  ]

  const switchSourceType = (id: string, newType: string) => {
    if (onUpdateSource) {
      onUpdateSource(id, { frequency: newType === 'sine' ? 2 : 1.5 })
    }
  }

  return (
    <CollapsibleSection
      title={`${t('visualizationSettings.waveSources')} (${waveSources.filter(s => s.active).length})`}
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Add Source Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.addNewSource')}</Label>
          
          {/* Add Source Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetIsAddingSource(!isAddingSource)}
            className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingSource ? t('visualizationSettings.cancelAdding') : t('visualizationSettings.addWaveSource')}
          </Button>
          
          {/* Quick Type Selection for New Sources */}
          {isAddingSource && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.defaultWaveType')}</Label>
              <div className="flex space-x-2">
                <Button
                  variant={selectedSourceType === 'sine' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedSourceType('sine')}
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Radio className="w-3 h-3 mr-1" />
                  {t('visualizationSettings.sine')}
                </Button>
                <Button
                  variant={selectedSourceType === 'cosine' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSetSelectedSourceType('cosine')}
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Radio className="w-3 h-3 mr-1" />
                  {t('visualizationSettings.cosine')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Global Controls */}
        {waveSources.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.globalWaveSettings')}</Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.allSourcesFrequency')}</Label>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {waveSources.length > 0 ? Math.round(waveSources.reduce((sum, source) => sum + source.frequency, 0) / waveSources.length * 10) / 10 : 0}
                </span>
              </div>
              <Slider
                value={[waveSources.length > 0 ? Math.round(waveSources.reduce((sum, source) => sum + source.frequency, 0) / waveSources.length * 10) / 10 : 2]}
                onValueChange={(value) => {
                  if (onUpdateSource) {
                    waveSources.forEach(source => {
                      onUpdateSource(source.id, { frequency: value[0] })
                    })
                  }
                }}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Existing Sources */}
        {waveSources.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.currentSources')}</Label>
            {waveSources.map(source => (
              <div key={source.id} className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <ListCard
                  icon={<Radio className="w-8 h-8 text-white" />}
                  iconColor={source.active ? COLOR_PALETTE.positive : COLOR_PALETTE.negative}
                  title={`${t('visualizationSettings.source')} ${source.id}`}
                  subtitle={`${t('visualizationSettings.position')}: (${Math.round(source.x)}, ${Math.round(source.y)})`}
                  onRemove={() => onRemoveSource(source.id)}
                  typeOptions={sourceTypeOptions}
                  currentType={selectedSourceType}
                  onTypeChange={(newType) => switchSourceType(source.id, newType)}
                  showTypeSwitch={!!onUpdateSource}
                />
                
                {/* Frequency Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.frequency')}</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{source.frequency}</span>
                  </div>
                  <Slider
                    value={[source.frequency]}
                    onValueChange={(value) => {
                      if (onUpdateSource) {
                        onUpdateSource(source.id, { frequency: value[0] })
                      }
                    }}
                    max={5}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Amplitude Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.amplitude')}</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{source.amplitude}</span>
                  </div>
                  <Slider
                    value={[source.amplitude]}
                    onValueChange={(value) => {
                      if (onUpdateSource) {
                        onUpdateSource(source.id, { amplitude: value[0] })
                      }
                    }}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Wavelength Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.wavelength')}</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{source.wavelength}</span>
                  </div>
                  <Slider
                    value={[source.wavelength]}
                    onValueChange={(value) => {
                      if (onUpdateSource) {
                        onUpdateSource(source.id, { wavelength: value[0] })
                      }
                    }}
                    max={200}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-active-${source.id}`}
                    checked={source.active}
                    onCheckedChange={(checked) => {
                      if (onUpdateSource) {
                        onUpdateSource(source.id, { active: checked as boolean })
                      }
                    }}
                  />
                  <Label htmlFor={`source-active-${source.id}`} className="text-sm">{t('visualizationSettings.active')}</Label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.displayOptions')}</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showWaveSources"
              checked={showWaveSources}
              onCheckedChange={(checked) => onSetShowWaveSources(checked as boolean)}
            />
            <Label htmlFor="showWaveSources" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showWaveSources')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInterference"
              checked={showInterference}
              onCheckedChange={(checked) => onSetShowInterference(checked as boolean)}
            />
            <Label htmlFor="showInterference" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showInterferencePattern')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showWavefronts"
              checked={showWavefronts}
              onCheckedChange={(checked) => onSetShowWavefronts(checked as boolean)}
            />
            <Label htmlFor="showWavefronts" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showWavefronts')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCircles"
              checked={showCircles}
              onCheckedChange={(checked) => onSetShowCircles(checked as boolean)}
            />
            <Label htmlFor="showCircles" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showCircles')}</Label>
          </div>
        </div>

        {waveSources.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">
            {t('visualizationSettings.noWaveSources')}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
} 