'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Plus, Magnet, ChevronDown, ChevronRight } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { COLOR_PALETTE } from '@/lib/constants'
import { useTranslation } from 'react-i18next'

interface Attractor {
  id: string
  x: number
  y: number
  strength: number
  radius: number
  active: boolean
}

interface SwarmSettingsProps {
  particleCount: number
  showParticles: boolean
  showTrails: boolean
  showAttractors: boolean
  isAddingAttractor: boolean
  attractors: Attractor[]
  expanded: boolean
  onToggleExpanded: () => void
  onSetParticleCount: (count: number) => void
  onSetShowParticles: (show: boolean) => void
  onSetShowTrails: (show: boolean) => void
  onSetShowAttractors: (show: boolean) => void
  onSetIsAddingAttractor: (adding: boolean) => void
  onRemoveAttractor: (id: string) => void
  onUpdateAttractor?: (id: string, updates: Partial<Attractor>) => void
}

export default function SwarmSettings({
  particleCount,
  showParticles,
  showTrails,
  showAttractors,
  isAddingAttractor,
  attractors,
  expanded,
  onToggleExpanded,
  onSetParticleCount,
  onSetShowParticles,
  onSetShowTrails,
  onSetShowAttractors,
  onSetIsAddingAttractor,
  onRemoveAttractor,
  onUpdateAttractor
}: SwarmSettingsProps) {
  const { t } = useTranslation()
  return (
         <CollapsibleSection
       title={`${t('visualizationSettings.swarmSettings')} (${particleCount} ${t('visualizationSettings.particleCount').toLowerCase()})`}
       defaultOpen={expanded}
     >
      <div className="space-y-4 mt-4">
        {/* Particle Count */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.particleCount')}</Label>
            <span className="text-xs text-gray-600 dark:text-gray-300">{particleCount}</span>
          </div>
          <Slider
            value={[particleCount]}
            onValueChange={(value) => onSetParticleCount(value[0])}
            max={500}
            min={10}
            step={10}
            className="w-full"
          />
        </div>

        {/* Add Attractor Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.addAttractor')}</Label>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetIsAddingAttractor(!isAddingAttractor)}
            className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingAttractor ? t('visualizationSettings.cancelAdding') : t('visualizationSettings.addAttractor')}
          </Button>
        </div>

        {/* Existing Attractors */}
        {attractors.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">{t('visualizationSettings.attractors')}</Label>
            {attractors.map(attractor => (
              <div key={attractor.id} className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <ListCard
                  icon={<Magnet className="w-8 h-8 text-white" />}
                  iconColor={attractor.active ? (attractor.strength > 0 ? COLOR_PALETTE.positive : COLOR_PALETTE.negative) : COLOR_PALETTE.neutral}
                  title={`Attractor ${attractor.id}`}
                  subtitle={`Position: (${Math.round(attractor.x)}, ${Math.round(attractor.y)})`}
                  onRemove={() => onRemoveAttractor(attractor.id)}
                />
                
                {/* Strength Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.strength')}</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{attractor.strength.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[attractor.strength]}
                    onValueChange={(value) => {
                      if (onUpdateAttractor) {
                        onUpdateAttractor(attractor.id, { strength: value[0] })
                      }
                    }}
                    max={2}
                    min={-2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Radius Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-gray-600 dark:text-gray-300">{t('visualizationSettings.radius')}</Label>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{attractor.radius}</span>
                  </div>
                  <Slider
                    value={[attractor.radius]}
                    onValueChange={(value) => {
                      if (onUpdateAttractor) {
                        onUpdateAttractor(attractor.id, { radius: value[0] })
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
                    id={`attractor-active-${attractor.id}`}
                    checked={attractor.active}
                    onCheckedChange={(checked) => {
                      if (onUpdateAttractor) {
                        onUpdateAttractor(attractor.id, { active: checked as boolean })
                      }
                    }}
                  />
                  <Label htmlFor={`attractor-active-${attractor.id}`} className="text-sm">{t('visualizationSettings.active')}</Label>
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
              id="showParticles"
              checked={showParticles}
              onCheckedChange={(checked) => onSetShowParticles(checked as boolean)}
            />
            <Label htmlFor="showParticles" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showParticles')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showTrails"
              checked={showTrails}
              onCheckedChange={(checked) => onSetShowTrails(checked as boolean)}
            />
            <Label htmlFor="showTrails" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showTrails')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showAttractors"
              checked={showAttractors}
              onCheckedChange={(checked) => onSetShowAttractors(checked as boolean)}
            />
            <Label htmlFor="showAttractors" className="text-sm text-gray-900 dark:text-white">{t('visualizationSettings.showAttractors')}</Label>
          </div>
        </div>

        {attractors.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">
            {t('visualizationSettings.noAttractors')}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
} 