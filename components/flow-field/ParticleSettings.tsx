'use client'

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'

interface ParticleSettingsProps {
  particleCount: number
  showParticleTrails: boolean
  showWaveFunctions: boolean
  showSuperposition: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetParticleCount: (count: number) => void
  onSetShowParticleTrails: (show: boolean) => void
  onSetShowWaveFunctions: (show: boolean) => void
  onSetShowSuperposition: (show: boolean) => void
}

export default function ParticleSettings({
  particleCount,
  showParticleTrails,
  showWaveFunctions,
  showSuperposition,
  expanded,
  onToggleExpanded,
  onSetParticleCount,
  onSetShowParticleTrails,
  onSetShowWaveFunctions,
  onSetShowSuperposition
}: ParticleSettingsProps) {
  const { t } = useTranslation()
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
        {t('visualizationSettings.particleSettings')}
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Particle Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('visualizationSettings.particleCount')}</Label>
              <div className="text-sm text-muted-foreground">{particleCount}</div>
            </div>
            <Slider
              value={[particleCount]}
              onValueChange={([value]) => onSetParticleCount(value)}
              max={200}
              min={20}
              step={10}
              className="w-full"
            />
          </div>

          {/* Visual Effects */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">{t('visualizationSettings.quantumEffects')}</Label>
            
            {/* Particle Trails */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="particle-trails"
                checked={showParticleTrails}
                onCheckedChange={onSetShowParticleTrails}
              />
              <Label htmlFor="particle-trails" className="text-sm">{t('visualizationSettings.showParticleTrails')}</Label>
            </div>

            {/* Wave Functions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wave-functions"
                checked={showWaveFunctions}
                onCheckedChange={onSetShowWaveFunctions}
              />
              <Label htmlFor="wave-functions" className="text-sm">{t('visualizationSettings.showWaveFunctions')}</Label>
            </div>

            {/* Superposition Effects */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="superposition"
                checked={showSuperposition}
                onCheckedChange={onSetShowSuperposition}
              />
              <Label htmlFor="superposition" className="text-sm">{t('visualizationSettings.showSuperpositionEffects')}</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 