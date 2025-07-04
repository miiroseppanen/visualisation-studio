'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, ChevronRight, Trash2, Mountain, MapPin, Navigation, TrendingUp } from 'lucide-react'
import type { ElevationPoint } from '@/lib/topography-physics'
import type { TopographyPanelState } from '@/lib/types'

interface ElevationPointControlsProps {
  elevationPoints: ElevationPoint[]
  panelState: TopographyPanelState
  onUpdatePanelState: (updates: Partial<TopographyPanelState>) => void
  onAddElevationPoint: (type: ElevationPoint['type']) => void
  onRemoveElevationPoint: (id: string) => void
  onUpdateElevationPoint: (id: string, updates: Partial<ElevationPoint>) => void
  onClearAll: () => void
}

const pointTypeIcons = {
  peak: Mountain,
  valley: MapPin,
  saddle: Navigation,
  ridge: TrendingUp,
}

const pointTypeColors = {
  peak: '#8B4513',
  valley: '#4169E1',
  saddle: '#9370DB',
  ridge: '#228B22',
}

export function ElevationPointControls({
  elevationPoints,
  panelState,
  onUpdatePanelState,
  onAddElevationPoint,
  onRemoveElevationPoint,
  onUpdateElevationPoint,
  onClearAll,
}: ElevationPointControlsProps) {
  const toggleExpanded = () => {
    onUpdatePanelState({ elevationPointsExpanded: !panelState.elevationPointsExpanded })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
      >
        {panelState.elevationPointsExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Elevation Points ({elevationPoints.length})
      </button>

      {panelState.elevationPointsExpanded && (
        <div className="space-y-4">
          {/* Add Point Controls */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Add Points</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(pointTypeIcons) as Array<ElevationPoint['type']>).map((type) => {
                const Icon = pointTypeIcons[type]
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => onAddElevationPoint(type)}
                    className="flex items-center gap-1 text-xs"
                    style={{ borderColor: pointTypeColors[type] }}
                  >
                    <Icon className="h-3 w-3" style={{ color: pointTypeColors[type] }} />
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Existing Points */}
          {elevationPoints.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Current Points</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {elevationPoints.map((point) => {
                  const Icon = pointTypeIcons[point.type]
                  return (
                    <div
                      key={point.id}
                      className="p-3 border rounded-lg space-y-2 w-full"
                      style={{ borderColor: pointTypeColors[point.type] + '40' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon 
                            className="h-4 w-4" 
                            style={{ color: pointTypeColors[point.type] }} 
                          />
                          <span className="font-medium text-sm">{point.name}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveElevationPoint(point.id)}
                          className="p-1 h-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Elevation: {Math.round(point.elevation)}m
                          </Label>
                          <Slider
                            value={[point.elevation]}
                            onValueChange={(value) =>
                              onUpdateElevationPoint(point.id, { elevation: value[0] })
                            }
                            min={0}
                            max={2000}
                            step={10}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Influence Radius: {Math.round(point.radius)}px
                          </Label>
                          <Slider
                            value={[point.radius]}
                            onValueChange={(value) =>
                              onUpdateElevationPoint(point.id, { radius: value[0] })
                            }
                            min={50}
                            max={300}
                            step={10}
                            className="mt-1"
                          />
                        </div>

                        <div className="text-xs text-muted-foreground pt-1">
                          Position: ({Math.round(point.x)}, {Math.round(point.y)})
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {elevationPoints.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Click on the canvas or use the buttons above to add elevation points
            </div>
          )}
        </div>
      )}
    </div>
  )
} 