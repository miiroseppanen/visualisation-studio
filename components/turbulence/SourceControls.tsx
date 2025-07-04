'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Zap, ArrowUp, ArrowDown, Wind, ChevronDown, ChevronRight, Plus, RotateCcw, ArrowRight } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import type { TurbulenceSource } from '@/lib/turbulence-physics'
import type { TurbulencePanelState } from '@/lib/types'
import { generateSourceId, generateSourceName } from '@/lib/turbulence-physics'
import { COLOR_PALETTE } from '@/lib/constants'

interface SourceControlsProps {
  sources: TurbulenceSource[]
  panelState: TurbulencePanelState
  onUpdatePanelState: (updates: Partial<TurbulencePanelState>) => void
  onAddSource: (type: TurbulenceSource['type']) => void
  onRemoveSource: (id: string) => void
  onUpdateSource: (id: string, updates: Partial<TurbulenceSource>) => void
  onClearAll: () => void
}

export function SourceControls({
  sources,
  panelState,
  onUpdatePanelState,
  onAddSource,
  onRemoveSource,
  onUpdateSource,
  onClearAll,
}: SourceControlsProps) {
  const sourceTypeLabels = {
    vortex: 'Vortex',
    source: 'Source',
    sink: 'Sink',
    uniform: 'Uniform Flow'
  }

  // Use centralized color palette
  const sourceTypeColors = COLOR_PALETTE

  const sourceTypeIcons = {
    vortex: Zap,
    source: ArrowUp,
    sink: ArrowDown,
    uniform: Wind
  }

  const sourceTypeOptions = [
    {
      value: 'vortex',
      label: 'Vortex',
      icon: <Zap className="w-4 h-4 text-white" />,
      color: sourceTypeColors.vortex
    },
    {
      value: 'source',
      label: 'Source',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      color: sourceTypeColors.source
    },
    {
      value: 'sink',
      label: 'Sink',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      color: sourceTypeColors.sink
    },
    {
      value: 'uniform',
      label: 'Uniform',
      icon: <Wind className="w-4 h-4 text-white" />,
      color: sourceTypeColors.uniform
    }
  ]

  const switchSourceType = (id: string, newType: string) => {
    const source = sources.find(s => s.id === id)
    if (source) {
      // Preserve existing properties and update type
      const updates: Partial<TurbulenceSource> = { type: newType as TurbulenceSource['type'] }
      
      // Reset angle for non-uniform types
      if (newType !== 'uniform' && source.type === 'uniform') {
        updates.angle = 0
      }
      
      onUpdateSource(id, updates)
    }
  }

  const toggleExpanded = () => {
    onUpdatePanelState({ sourcesExpanded: !panelState.sourcesExpanded })
  }

  return (
    <div className="space-y-3">
      <CollapsibleHeader
        title={`Turbulence Sources (${sources.length})`}
        isExpanded={panelState.sourcesExpanded}
        onToggle={toggleExpanded}
      />

      {panelState.sourcesExpanded && (
        <div className="space-y-4 mt-4">
          {/* Add Source Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">Add Sources</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('vortex')}
                className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Zap className="w-3 h-3 mr-1" />
                Vortex
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('source')}
                className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                Source
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('sink')}
                className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowDown className="w-3 h-3 mr-1" />
                Sink
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('uniform')}
                className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Wind className="w-3 h-3 mr-1" />
                Uniform
              </Button>
            </div>
          </div>

          {/* Current Sources Header and Clear All */}
          {sources.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Current Sources</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Source List */}
          {sources.length > 0 && (
            <div className="space-y-3 mt-2">
              {sources.map((source) => {
                const Icon = sourceTypeIcons[source.type]
                return (
                  <ListCard
                    key={source.id}
                    icon={<Icon className="w-8 h-8 text-white" />}
                    iconColor={sourceTypeColors[source.type]}
                    title={source.name}
                    subtitle={`Position: (${Math.round(source.x)}, ${Math.round(source.y)})`}
                    onRemove={() => onRemoveSource(source.id)}
                    typeOptions={sourceTypeOptions}
                    currentType={source.type}
                    onTypeChange={(newType) => switchSourceType(source.id, newType)}
                    showTypeSwitch={true}
                  >
                    {/* Source Controls */}
                    <div className="space-y-2">
                      {/* Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs text-gray-600 dark:text-gray-300">Strength</Label>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {source.strength}
                          </span>
                        </div>
                        <Slider
                          value={[source.strength]}
                          onValueChange={([value]) =>
                            onUpdateSource(source.id, { strength: value })
                          }
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Angle (for uniform flow) */}
                      {source.type === 'uniform' && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <Label className="text-xs text-gray-600 dark:text-gray-300">Angle</Label>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {Math.round(source.angle || 0)}°
                            </span>
                          </div>
                          <Slider
                            value={[source.angle || 0]}
                            onValueChange={([value]) =>
                              onUpdateSource(source.id, { angle: value })
                            }
                            max={360}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </ListCard>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 