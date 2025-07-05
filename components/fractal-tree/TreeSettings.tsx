'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Play, Pause, TreePine } from 'lucide-react'

interface TreeSettingsProps {
  maxDepth: number
  branchLength: number
  showLeaves: boolean
  showBranches: boolean
  showGrowth: boolean
  autoGrow: boolean
  isGrowing: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onSetMaxDepth: (depth: number) => void
  onSetBranchLength: (length: number) => void
  onSetShowLeaves: (show: boolean) => void
  onSetShowBranches: (show: boolean) => void
  onSetShowGrowth: (show: boolean) => void
  onSetAutoGrow: (auto: boolean) => void
  onToggleGrowth: () => void
}

export default function TreeSettings({
  maxDepth,
  branchLength,
  showLeaves,
  showBranches,
  showGrowth,
  autoGrow,
  isGrowing,
  expanded,
  onToggleExpanded,
  onSetMaxDepth,
  onSetBranchLength,
  onSetShowLeaves,
  onSetShowBranches,
  onSetShowGrowth,
  onSetAutoGrow,
  onToggleGrowth
}: TreeSettingsProps) {
  return (
    <CollapsibleSection
      title="Tree Settings"
      defaultOpen={expanded}
    >
      <div className="space-y-4 mt-4">
        {/* Growth Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">Growth Controls</Label>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleGrowth}
            className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isGrowing ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Growth
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Growth
              </>
            )}
          </Button>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoGrow"
              checked={autoGrow}
              onCheckedChange={(checked) => onSetAutoGrow(checked as boolean)}
            />
            <Label htmlFor="autoGrow" className="text-sm text-gray-900 dark:text-white">Auto Restart Growth</Label>
          </div>
        </div>

        {/* Tree Structure */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">Tree Structure</Label>
          
          {/* Max Depth */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-gray-600 dark:text-gray-300">Max Depth</Label>
              <span className="text-xs text-gray-600 dark:text-gray-300">{maxDepth}</span>
            </div>
            <Slider
              value={[maxDepth]}
              onValueChange={(value) => onSetMaxDepth(value[0])}
              max={12}
              min={3}
              step={1}
              className="w-full"
            />
          </div>

          {/* Branch Length */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-gray-600 dark:text-gray-300">Base Branch Length</Label>
              <span className="text-xs text-gray-600 dark:text-gray-300">{branchLength}</span>
            </div>
            <Slider
              value={[branchLength]}
              onValueChange={(value) => onSetBranchLength(value[0])}
              max={200}
              min={20}
              step={10}
              className="w-full"
            />
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">Display Options</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showBranches"
              checked={showBranches}
              onCheckedChange={(checked) => onSetShowBranches(checked as boolean)}
            />
            <Label htmlFor="showBranches" className="text-sm text-gray-900 dark:text-white">Show Branches</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showLeaves"
              checked={showLeaves}
              onCheckedChange={(checked) => onSetShowLeaves(checked as boolean)}
            />
            <Label htmlFor="showLeaves" className="text-sm text-gray-900 dark:text-white">Show Leaves</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showGrowth"
              checked={showGrowth}
              onCheckedChange={(checked) => onSetShowGrowth(checked as boolean)}
            />
            <Label htmlFor="showGrowth" className="text-sm text-gray-900 dark:text-white">Show Growth Progress</Label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
} 