'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Settings, Grid, Eye } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface Rule {
  name: string
  birth: number[]
  survive: number[]
  description: string
}

interface CellularAutomataRulesProps {
  currentRule: Rule
  showGrid: boolean
  showAge: boolean
  colorMode: 'binary' | 'age' | 'neighbors'
  cellSize: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetCurrentRule: (rule: Rule) => void
  onSetShowGrid: (show: boolean) => void
  onSetShowAge: (show: boolean) => void
  onSetColorMode: (mode: 'binary' | 'age' | 'neighbors') => void
  onSetCellSize: (size: number) => void
}

const predefinedRules: Rule[] = [
  {
    name: "Conway's Game of Life",
    birth: [3],
    survive: [2, 3],
    description: "Classic cellular automaton rules"
  },
  {
    name: "High Life",
    birth: [3, 6],
    survive: [2, 3],
    description: "Variation with additional birth condition"
  },
  {
    name: "Day & Night",
    birth: [3, 6, 7, 8],
    survive: [3, 4, 6, 7, 8],
    description: "Symmetric rule set"
  },
  {
    name: "Seeds",
    birth: [2],
    survive: [],
    description: "Cells only survive if they have exactly 2 neighbors"
  },
  {
    name: "Replicator",
    birth: [1, 3, 5, 7],
    survive: [1, 3, 5, 7],
    description: "Creates self-replicating patterns"
  }
]

export default function CellularAutomataRules({
  currentRule,
  showGrid,
  showAge,
  colorMode,
  cellSize,
  expanded,
  onToggleExpanded,
  onSetCurrentRule,
  onSetShowGrid,
  onSetShowAge,
  onSetColorMode,
  onSetCellSize
}: CellularAutomataRulesProps) {
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
        <Settings className="h-4 w-4" />
        {t('cellular.rulesAndDisplay')}
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Rule Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('cellular.ruleSets')}</Label>
            
            {predefinedRules.map((rule) => (
              <Button
                key={rule.name}
                variant={currentRule.name === rule.name ? "default" : "outline"}
                size="sm"
                onClick={() => onSetCurrentRule(rule)}
                className="w-full justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-xs text-muted-foreground">
                    B{rule.birth.join(',')}/S{rule.survive.join(',')}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Current Rule Info */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-medium">{t('cellular.currentRule')}</Label>
            <div className="text-sm">
              <div className="font-medium">{currentRule.name}</div>
              <div className="text-muted-foreground">
                {t('cellular.birth')}: {currentRule.birth.join(', ')} | {t('cellular.survive')}: {currentRule.survive.join(', ')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentRule.description}
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">{t('cellular.displaySettings')}</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-grid"
                checked={showGrid}
                onCheckedChange={onSetShowGrid}
              />
              <Label htmlFor="show-grid" className="text-sm">{t('cellular.showGrid')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-age"
                checked={showAge}
                onCheckedChange={onSetShowAge}
              />
              <Label htmlFor="show-age" className="text-sm">{t('cellular.showAge')}</Label>
            </div>

            {/* Color Mode */}
            <div className="space-y-2">
              <Label className="text-sm">{t('cellular.colorMode')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={colorMode === 'binary' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetColorMode('binary')}
                >
                  {t('cellular.binary')}
                </Button>
                <Button
                  variant={colorMode === 'age' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetColorMode('age')}
                >
                  {t('cellular.age')}
                </Button>
                <Button
                  variant={colorMode === 'neighbors' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetColorMode('neighbors')}
                >
                  {t('cellular.neighbors')}
                </Button>
              </div>
            </div>

            {/* Cell Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('cellular.cellSize')}</Label>
                <div className="text-sm text-muted-foreground">{cellSize}</div>
              </div>
              <Slider
                value={[cellSize]}
                onValueChange={([value]) => onSetCellSize(value)}
                max={12}
                min={2}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 