'use client'

import React, { useMemo, useRef, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import type { TurbulenceSettings } from '@/lib/types'
import { 
  MIN_TURBULENCE_LINE_COUNT, 
  MAX_TURBULENCE_LINE_COUNT, 
  TURBULENCE_LINE_COUNT_STEP,
  MIN_TURBULENCE_LINE_LENGTH,
  MAX_TURBULENCE_LINE_LENGTH,
  TURBULENCE_LINE_LENGTH_STEP,
  MIN_STREAMLINE_STEPS,
  MAX_STREAMLINE_STEPS,
  STREAMLINE_STEPS_STEP,
  MIN_STREAMLINE_STEP_SIZE,
  MAX_STREAMLINE_STEP_SIZE,
  STREAMLINE_STEP_SIZE_STEP
} from '@/lib/constants'

interface TurbulenceSettingsProps {
  settings: TurbulenceSettings
  expanded: boolean
  onToggleExpanded: () => void
  onSettingsChange: (updates: Partial<TurbulenceSettings>) => void
}

export function TurbulenceSettings({ 
  settings, 
  expanded, 
  onToggleExpanded, 
  onSettingsChange 
}: TurbulenceSettingsProps) {
  // Use refs to store previous values and prevent unnecessary updates
  const prevLineCount = useRef(settings.lineCount);
  const prevLineLength = useRef(settings.lineLength);
  const prevStreamlineSteps = useRef(settings.streamlineSteps ?? 150);
  const prevStreamlineStepSize = useRef(settings.streamlineStepSize ?? 3);
  
  // Ensure default values to prevent infinite loops
  const streamlineSteps = settings.streamlineSteps ?? 150;
  const streamlineStepSize = settings.streamlineStepSize ?? 3;
  
  // Create stable value arrays only when values actually change
  const lineCountValue = useMemo(() => {
    if (prevLineCount.current !== settings.lineCount) {
      prevLineCount.current = settings.lineCount;
    }
    return [settings.lineCount];
  }, [settings.lineCount]);
  
  const lineLengthValue = useMemo(() => {
    if (prevLineLength.current !== settings.lineLength) {
      prevLineLength.current = settings.lineLength;
    }
    return [settings.lineLength];
  }, [settings.lineLength]);
  
  const streamlineStepsValue = useMemo(() => {
    if (prevStreamlineSteps.current !== streamlineSteps) {
      prevStreamlineSteps.current = streamlineSteps;
    }
    return [streamlineSteps];
  }, [streamlineSteps]);
  
  const streamlineStepSizeValue = useMemo(() => {
    if (prevStreamlineStepSize.current !== streamlineStepSize) {
      prevStreamlineStepSize.current = streamlineStepSize;
    }
    return [streamlineStepSize];
  }, [streamlineStepSize]);

  // Memoize onChange handlers to prevent recreation
  const handleLineCountChange = useCallback(([value]: number[]) => {
    if (value !== settings.lineCount) {
      onSettingsChange({ lineCount: value });
    }
  }, [settings.lineCount, onSettingsChange]);

  const handleLineLengthChange = useCallback(([value]: number[]) => {
    if (value !== settings.lineLength) {
      onSettingsChange({ lineLength: value });
    }
  }, [settings.lineLength, onSettingsChange]);

  const handleStreamlineStepsChange = useCallback(([value]: number[]) => {
    if (value !== streamlineSteps) {
      onSettingsChange({ streamlineSteps: value });
    }
  }, [streamlineSteps, onSettingsChange]);

  const handleStreamlineStepSizeChange = useCallback(([value]: number[]) => {
    if (value !== streamlineStepSize) {
      onSettingsChange({ streamlineStepSize: value });
    }
  }, [streamlineStepSize, onSettingsChange]);

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
        Turbulence Settings
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Visualization Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Visualization Mode</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="streamline-mode"
                  checked={settings.streamlineMode}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ streamlineMode: checked as boolean, flowingMode: false })
                  }
                />
                <Label htmlFor="streamline-mode" className="text-sm">
                  Streamlines
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flowing-mode"
                  checked={settings.flowingMode}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ flowingMode: checked as boolean, streamlineMode: false })
                  }
                />
                <Label htmlFor="flowing-mode" className="text-sm">
                  Flowing Particles
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vector-mode"
                  checked={!settings.streamlineMode && !settings.flowingMode}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ streamlineMode: false, flowingMode: false })
                  }
                />
                <Label htmlFor="vector-mode" className="text-sm">
                  Static Vector Field
                </Label>
              </div>
            </div>
          </div>

          {/* Line Count */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">
                {settings.streamlineMode ? 'Streamline Density' : 'Vector Density'}
              </Label>
              <span className="text-xs text-muted-foreground">
                {settings.lineCount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={lineCountValue}
              onValueChange={handleLineCountChange}
              min={MIN_TURBULENCE_LINE_COUNT}
              max={MAX_TURBULENCE_LINE_COUNT}
              step={TURBULENCE_LINE_COUNT_STEP}
              className="w-full"
            />
          </div>

          {/* Line Length (for vector mode) */}
          {!settings.streamlineMode && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Vector Length</Label>
                <span className="text-xs text-muted-foreground">
                  {settings.lineLength}px
                </span>
              </div>
              <Slider
                value={lineLengthValue}
                onValueChange={handleLineLengthChange}
                min={MIN_TURBULENCE_LINE_LENGTH}
                max={MAX_TURBULENCE_LINE_LENGTH}
                step={TURBULENCE_LINE_LENGTH_STEP}
                className="w-full"
              />
            </div>
          )}

          {/* Streamline Settings (for streamline mode) */}
          {settings.streamlineMode && (
            <>
              {/* Streamline Steps */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Streamline Length</Label>
                  <span className="text-xs text-muted-foreground">
                    {streamlineSteps} steps
                  </span>
                </div>
                <Slider
                  value={streamlineStepsValue}
                  onValueChange={handleStreamlineStepsChange}
                  min={MIN_STREAMLINE_STEPS}
                  max={MAX_STREAMLINE_STEPS}
                  step={STREAMLINE_STEPS_STEP}
                  className="w-full"
                />
              </div>

              {/* Streamline Step Size */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Step Size</Label>
                  <span className="text-xs text-muted-foreground">
                    {streamlineStepSize}px
                  </span>
                </div>
                <Slider
                  value={streamlineStepSizeValue}
                  onValueChange={handleStreamlineStepSizeChange}
                  min={MIN_STREAMLINE_STEP_SIZE}
                  max={MAX_STREAMLINE_STEP_SIZE}
                  step={STREAMLINE_STEP_SIZE_STEP}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Show Sources */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-sources"
                checked={settings.showSources}
                onCheckedChange={(checked) =>
                  onSettingsChange({ showSources: checked as boolean })
                }
              />
              <Label htmlFor="show-sources" className="text-sm">
                Show Turbulence Sources
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 