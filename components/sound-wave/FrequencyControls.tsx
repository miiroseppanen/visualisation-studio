'use client'

import React from 'react'
import { ChevronDown, ChevronRight, Volume2, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface FrequencyControlsProps {
  onInitializeAudio: () => void
  isListening: boolean
  expanded: boolean
  onToggleExpanded: () => void
}

export default function FrequencyControls({
  onInitializeAudio,
  isListening,
  expanded,
  onToggleExpanded
}: FrequencyControlsProps) {
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
        <Volume2 className="h-4 w-4" />
        {t('sound.audioInput')}
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 mt-4">
          {/* Audio Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t('sound.audioStatus')}</div>
              <div className="text-sm text-muted-foreground">
                {isListening ? t('sound.listening') : t('sound.notConnected')}
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="space-y-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={onInitializeAudio}
              className="w-full"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  {t('sound.stopListening')}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  {t('sound.startListening')}
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>• {t('sound.instructionStartListening')}</p>
            <p>• {t('sound.instructionFrequencyAnalysis')}</p>
            <p>• {t('sound.instructionMicPermission')}</p>
            <p>• {t('sound.instructionSyntheticData')}</p>
          </div>
        </div>
      )}
    </div>
  )
} 