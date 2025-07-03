'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FlowSettings, NoiseSettings } from '@/lib/types'
import type { TurbulencePanelState } from '@/lib/types'

interface FlowControlsProps {
  flowSettings: FlowSettings
  noiseSettings: NoiseSettings
  panelState: TurbulencePanelState
  onUpdatePanelState: (updates: Partial<TurbulencePanelState>) => void
  onFlowChange: (updates: Partial<FlowSettings>) => void
  onNoiseChange: (updates: Partial<NoiseSettings>) => void
}

export function FlowControls({
  flowSettings,
  noiseSettings,
  panelState,
  onUpdatePanelState,
  onFlowChange,
  onNoiseChange,
}: FlowControlsProps) {
  const regenerateNoise = () => {
    onNoiseChange({ seed: Math.random() * 1000 })
  }

  const toggleFlowExpanded = () => {
    onUpdatePanelState({ flowSettingsExpanded: !panelState.flowSettingsExpanded })
  }

  const toggleNoiseExpanded = () => {
    onUpdatePanelState({ noiseExpanded: !panelState.noiseExpanded })
  }

  return (
    <div className="space-y-8">
      {/* Base Flow Settings */}
      <div>
        <button
          className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
          onClick={toggleFlowExpanded}
        >
          {panelState.flowSettingsExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Base Flow
        </button>

        {panelState.flowSettingsExpanded && (
          <div className="space-y-4 pl-4 mt-4">
            {/* Enable Base Flow */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-flow"
                checked={flowSettings.enabled}
                onCheckedChange={(checked) =>
                  onFlowChange({ enabled: checked as boolean })
                }
              />
              <Label htmlFor="enable-flow" className="text-sm">
                Enable Base Flow
              </Label>
            </div>

            {flowSettings.enabled && (
              <>
                {/* Flow Velocity */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Flow Velocity</Label>
                    <span className="text-xs text-muted-foreground">
                      {flowSettings.baseVelocity.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[flowSettings.baseVelocity]}
                    onValueChange={([value]) => onFlowChange({ baseVelocity: value })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Flow Angle */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Flow Direction</Label>
                    <span className="text-xs text-muted-foreground">
                      {flowSettings.baseAngle}°
                    </span>
                  </div>
                  <Slider
                    value={[flowSettings.baseAngle]}
                    onValueChange={([value]) => onFlowChange({ baseAngle: value })}
                    min={0}
                    max={360}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Noise Settings */}
      <div>
        <button
          className="flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors"
          onClick={toggleNoiseExpanded}
        >
          {panelState.noiseExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Turbulence Noise
        </button>

        {panelState.noiseExpanded && (
          <div className="space-y-4 pl-4 mt-4">
            {/* Scale */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Noise Scale</Label>
                <span className="text-xs text-muted-foreground">
                  {noiseSettings.scale.toFixed(3)}
                </span>
              </div>
              <Slider
                value={[noiseSettings.scale]}
                onValueChange={([value]) => onNoiseChange({ scale: value })}
                min={0.001}
                max={0.05}
                step={0.001}
                className="w-full"
              />
            </div>

            {/* Octaves */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Noise Octaves</Label>
                <span className="text-xs text-muted-foreground">
                  {noiseSettings.octaves}
                </span>
              </div>
              <Slider
                value={[noiseSettings.octaves]}
                onValueChange={([value]) => onNoiseChange({ octaves: value })}
                min={1}
                max={8}
                step={1}
                className="w-full"
              />
            </div>

            {/* Persistence */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Persistence</Label>
                <span className="text-xs text-muted-foreground">
                  {noiseSettings.persistence.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[noiseSettings.persistence]}
                onValueChange={([value]) => onNoiseChange({ persistence: value })}
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Lacunarity */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Lacunarity</Label>
                <span className="text-xs text-muted-foreground">
                  {noiseSettings.lacunarity.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[noiseSettings.lacunarity]}
                onValueChange={([value]) => onNoiseChange({ lacunarity: value })}
                min={1.0}
                max={4.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Regenerate Noise */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateNoise}
                className="w-full text-xs"
              >
                Regenerate Noise Pattern
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Seed: {Math.round(noiseSettings.seed)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 