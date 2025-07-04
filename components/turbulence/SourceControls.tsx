'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TurbulenceSource } from '@/lib/turbulence-physics'
import type { TurbulencePanelState } from '@/lib/types'

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

  const sourceTypeColors = {
    vortex: 'bg-purple-500',
    source: 'bg-green-500',
    sink: 'bg-red-500',
    uniform: 'bg-yellow-500'
  }

  const toggleExpanded = () => {
    onUpdatePanelState({ sourcesExpanded: !panelState.sourcesExpanded })
  }

  return (
    <div>
      <button
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
        onClick={toggleExpanded}
      >
        {panelState.sourcesExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Turbulence Sources ({sources.length})
      </button>

      {panelState.sourcesExpanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Add Source Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Sources</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('vortex')}
                className="text-xs"
              >
                + Vortex
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('source')}
                className="text-xs"
              >
                + Source
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('sink')}
                className="text-xs"
              >
                + Sink
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSource('uniform')}
                className="text-xs"
              >
                + Uniform
              </Button>
            </div>
          </div>

          {/* Current Sources Header and Clear All */}
          {sources.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Label className="text-sm font-medium">Current Sources</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Source List (scrollable only) */}
          {sources.length > 0 && (
            <div className="space-y-3 mt-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-3 border rounded-lg space-y-2 bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${sourceTypeColors[source.type]}`}
                      />
                      <span className="text-sm font-medium">{source.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({sourceTypeLabels[source.type]})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSource(source.id)}
                      className="text-xs text-red-600 hover:text-red-700 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>

                  {/* Source Controls */}
                  <div className="space-y-2">
                    {/* Strength */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label className="text-xs">Strength</Label>
                        <span className="text-xs text-muted-foreground">
                          {source.strength}
                        </span>
                      </div>
                      <Slider
                        value={[source.strength]}
                        onValueChange={([value]) =>
                          onUpdateSource(source.id, { strength: value })
                        }
                        min={10}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Angle (for uniform flow) */}
                    {source.type === 'uniform' && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Angle</Label>
                          <span className="text-xs text-muted-foreground">
                            {source.angle}°
                          </span>
                        </div>
                        <Slider
                          value={[source.angle]}
                          onValueChange={([value]) =>
                            onUpdateSource(source.id, { angle: value })
                          }
                          min={0}
                          max={360}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Position */}
                    <div className="text-xs text-muted-foreground">
                      Position: ({Math.round(source.x)}, {Math.round(source.y)})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sources.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Click on the canvas or use buttons above to add turbulence sources
            </div>
          )}
        </div>
      )}
    </div>
  )
} 