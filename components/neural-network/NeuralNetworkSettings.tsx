'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Layers, Eye, Zap } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface NeuralNetworkSettingsProps {
  layers: number[]
  showWeights: boolean
  showActivations: boolean
  showPulses: boolean
  nodeSize: number
  connectionOpacity: number
  expanded: boolean
  onToggleExpanded: () => void
  onSetLayers: (layers: number[]) => void
  onSetShowWeights: (show: boolean) => void
  onSetShowActivations: (show: boolean) => void
  onSetShowPulses: (show: boolean) => void
  onSetNodeSize: (size: number) => void
  onSetConnectionOpacity: (opacity: number) => void
}

export default function NeuralNetworkSettings({
  layers,
  showWeights,
  showActivations,
  showPulses,
  nodeSize,
  connectionOpacity,
  expanded,
  onToggleExpanded,
  onSetLayers,
  onSetShowWeights,
  onSetShowActivations,
  onSetShowPulses,
  onSetNodeSize,
  onSetConnectionOpacity
}: NeuralNetworkSettingsProps) {
  const addLayer = () => {
    const newLayers = [...layers]
    newLayers.splice(newLayers.length - 1, 0, 4) // Add hidden layer before output
    onSetLayers(newLayers)
  }

  const removeLayer = () => {
    if (layers.length > 3) {
      const newLayers = [...layers]
      newLayers.splice(newLayers.length - 2, 1) // Remove hidden layer before output
      onSetLayers(newLayers)
    }
  }

  const updateLayerSize = (layerIndex: number, size: number) => {
    const newLayers = [...layers]
    newLayers[layerIndex] = size
    onSetLayers(newLayers)
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
        <Layers className="h-4 w-4" />
        Network Architecture
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Layer Configuration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Network Layers</Label>
            
            {layers.map((layerSize, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    {index === 0 ? 'Input' : index === layers.length - 1 ? 'Output' : `Hidden ${index}`}
                  </Label>
                  <div className="text-xs text-muted-foreground">{layerSize}</div>
                </div>
                <Slider
                  value={[layerSize]}
                  onValueChange={([value]) => updateLayerSize(index, value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addLayer}
                className="flex-1"
              >
                Add Layer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeLayer}
                disabled={layers.length <= 3}
                className="flex-1"
              >
                Remove Layer
              </Button>
            </div>
          </div>

          {/* Visual Settings */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Visual Settings</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-weights"
                checked={showWeights}
                onCheckedChange={onSetShowWeights}
              />
              <Label htmlFor="show-weights" className="text-sm">Show Weights</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-activations"
                checked={showActivations}
                onCheckedChange={onSetShowActivations}
              />
              <Label htmlFor="show-activations" className="text-sm">Show Activations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-pulses"
                checked={showPulses}
                onCheckedChange={onSetShowPulses}
              />
              <Label htmlFor="show-pulses" className="text-sm">Show Pulses</Label>
            </div>

            {/* Node Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Node Size</Label>
                <div className="text-sm text-muted-foreground">{nodeSize}</div>
              </div>
              <Slider
                value={[nodeSize]}
                onValueChange={([value]) => onSetNodeSize(value)}
                max={40}
                min={10}
                step={2}
                className="w-full"
              />
            </div>

            {/* Connection Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Connection Opacity</Label>
                <div className="text-sm text-muted-foreground">{Math.round(connectionOpacity * 100)}%</div>
              </div>
              <Slider
                value={[connectionOpacity]}
                onValueChange={([value]) => onSetConnectionOpacity(value)}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 