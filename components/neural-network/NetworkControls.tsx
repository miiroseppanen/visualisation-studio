'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Play, Pause, Zap, Brain } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface NetworkControlsProps {
  isTraining: boolean
  learningRate: number
  currentEpoch: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetIsTraining: (training: boolean) => void
  onSetLearningRate: (rate: number) => void
  onTestNetwork: () => void
  onGenerateNetwork: () => void
}

export default function NetworkControls({
  isTraining,
  learningRate,
  currentEpoch,
  expanded,
  onToggleExpanded,
  onSetIsTraining,
  onSetLearningRate,
  onTestNetwork,
  onGenerateNetwork
}: NetworkControlsProps) {
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
        <Brain className="h-4 w-4" />
        Training Controls
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Training Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Training Status</Label>
              <div className="text-sm text-muted-foreground">
                {isTraining ? 'Training' : 'Idle'}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Current Epoch</Label>
              <div className="text-xs text-muted-foreground">{currentEpoch}</div>
            </div>
          </div>

          {/* Training Controls */}
          <div className="space-y-2">
            <Button
              variant={isTraining ? "destructive" : "default"}
              size="sm"
              onClick={() => onSetIsTraining(!isTraining)}
              className="w-full"
            >
              {isTraining ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Training
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
          </div>

          {/* Learning Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Learning Rate</Label>
              <div className="text-sm text-muted-foreground">{learningRate.toFixed(2)}</div>
            </div>
            <Slider
              value={[learningRate]}
              onValueChange={([value]) => onSetLearningRate(value)}
              max={1}
              min={0.01}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Network Actions */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-medium">Network Actions</Label>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onTestNetwork}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test Network
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateNetwork}
              className="w-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              Regenerate Network
            </Button>
          </div>

          {/* Training Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Training runs forward propagation with random data</p>
            <p>• Watch activations flow through the network</p>
            <p>• Connection weights are visualized by color and thickness</p>
            <p>• Use Test Network to see a single forward pass</p>
          </div>
        </div>
      )}
    </div>
  )
} 