'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Plus, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PatternControlsProps {
  onAddPattern: (pattern: boolean[][], centerX: number, centerY: number) => void
  onStepSimulation: () => void
  onClearGrid: () => void
  expanded: boolean
  onToggleExpanded: () => void
}

const predefinedPatterns = [
  {
    name: "Glider",
    pattern: [
      [false, true, false],
      [false, false, true],
      [true, true, true]
    ]
  },
  {
    name: "Blinker",
    pattern: [
      [true, true, true]
    ]
  },
  {
    name: "Block",
    pattern: [
      [true, true],
      [true, true]
    ]
  },
  {
    name: "Toad",
    pattern: [
      [false, true, true, true],
      [true, true, true, false]
    ]
  },
  {
    name: "Beacon",
    pattern: [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, true, true],
      [false, false, true, true]
    ]
  },
  {
    name: "Pulsar",
    pattern: [
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [false, false, true, true, true, false, false, false, true, true, true, false, false]
    ]
  }
]

export default function PatternControls({
  onAddPattern,
  onStepSimulation,
  onClearGrid,
  expanded,
  onToggleExpanded
}: PatternControlsProps) {
  const addPatternAtCenter = (pattern: boolean[][]) => {
    onAddPattern(pattern, 50, 50) // Center of 100x100 grid
  }

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
        <Plus className="h-4 w-4" />
        Patterns & Controls
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Simulation Controls */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onStepSimulation}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Step Simulation
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearGrid}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Grid
            </Button>
          </div>

          {/* Predefined Patterns */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-sm font-medium">Predefined Patterns</div>
            
            <div className="grid grid-cols-2 gap-2">
              {predefinedPatterns.map((pattern) => (
                <Button
                  key={pattern.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addPatternAtCenter(pattern.pattern)}
                  className="text-xs"
                >
                  {pattern.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>• Click on the grid to toggle cells</p>
            <p>• Use Step Simulation to advance one generation</p>
            <p>• Try different rule sets to see new behaviors</p>
            <p>• Patterns will be placed at the center of the grid</p>
          </div>
        </div>
      )}
    </div>
  )
} 