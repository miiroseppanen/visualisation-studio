'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Mountain, ChevronDown, ChevronRight, Plus, RotateCcw } from 'lucide-react'
import { ListCard } from '@/components/ui/list-card'
import { CollapsibleHeader } from '@/components/ui/collapsible-header'
import type { ElevationPoint } from '@/lib/topography-physics'
import type { TopographyPanelState } from '@/lib/types'
import { generateElevationId, generateElevationName } from '@/lib/topography-physics'
import { COLOR_PALETTE } from '@/lib/constants'

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
  valley: ChevronDown,
  saddle: ChevronRight,
  ridge: Plus,
}

  const pointTypeColors = {
    peak: COLOR_PALETTE.peak,
    valley: COLOR_PALETTE.valley,
    saddle: COLOR_PALETTE.saddle,
    ridge: COLOR_PALETTE.ridge,
  }

const pointTypeOptions = [
  {
    value: 'peak',
    label: 'Peak',
    icon: <Mountain className="w-4 h-4 text-white" />,
    color: pointTypeColors.peak
  },
  {
    value: 'valley',
    label: 'Valley',
    icon: <ChevronDown className="w-4 h-4 text-white" />,
    color: pointTypeColors.valley
  },
  {
    value: 'saddle',
    label: 'Saddle',
    icon: <ChevronRight className="w-4 h-4 text-white" />,
    color: pointTypeColors.saddle
  },
  {
    value: 'ridge',
    label: 'Ridge',
    icon: <Plus className="w-4 h-4 text-white" />,
    color: pointTypeColors.ridge
  }
]

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

  const switchPointType = (id: string, newType: string) => {
    onUpdateElevationPoint(id, { type: newType as ElevationPoint['type'] })
  }

  return (
    <div className="space-y-3">
      <CollapsibleHeader
        title={`Elevation Points (${elevationPoints.length})`}
        isExpanded={panelState.elevationPointsExpanded}
        onToggle={toggleExpanded}
      />

      {panelState.elevationPointsExpanded && (
        <div className="space-y-4 mt-4">
          {/* Add Point Controls */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-white">Add Points</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(pointTypeIcons) as Array<ElevationPoint['type']>).map((type) => {
                const Icon = pointTypeIcons[type]
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => onAddElevationPoint(type)}
                    className="flex items-center gap-1 text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Existing Points</Label>
              {elevationPoints.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {elevationPoints.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                No elevation points added yet
              </div>
            ) : (
              <div className="space-y-2">
                {elevationPoints.map((point) => {
                  const Icon = pointTypeIcons[point.type]
                  return (
                    <ListCard
                      key={point.id}
                      title={`${point.type} ${point.id}`}
                      subtitle={`${Math.round(point.x)}, ${Math.round(point.y)}`}
                      icon={<Icon className="w-8 h-8 text-white" />}
                      iconColor={pointTypeColors[point.type]}
                      onRemove={() => onRemoveElevationPoint(point.id)}
                      typeOptions={pointTypeOptions}
                      currentType={point.type}
                      onTypeChange={(newType) => switchPointType(point.id, newType)}
                      showTypeSwitch={true}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 