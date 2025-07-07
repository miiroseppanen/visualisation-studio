'use client'

import React from 'react'
import { ChevronDown, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type VisualizationOption } from '@/lib/navigation-config'
import { useTranslation } from 'react-i18next'

interface VisualizationDropdownProps {
  currentVisualization: VisualizationOption | null
  allVisualizations: VisualizationOption[]
  verifiedVisualizations: VisualizationOption[]
  inProgressVisualizations: VisualizationOption[]
  onVisualizationSelect: (id: string) => void
  className?: string
  hideNonEssential?: boolean
}

export default function VisualizationDropdown({
  currentVisualization,
  allVisualizations,
  verifiedVisualizations,
  inProgressVisualizations,
  onVisualizationSelect,
  className = '',
  hideNonEssential = false
}: VisualizationDropdownProps) {
  const { t } = useTranslation()
  
  // Helper to convert kebab-case to camelCase
  function kebabToCamel(str: string) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  const handleVisualizationClick = (id: string) => {
    onVisualizationSelect(id)
  }

  // When hiding non-essential elements, show only the visualization name
  if (hideNonEssential) {
    return (
      <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 ${className}`}>
        {currentVisualization?.icon && (
          <currentVisualization.icon className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="text-base sm:text-lg font-normal truncate">
          {currentVisualization?.name || t('visualisation.selectVisualisation')}
        </span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 h-12 min-w-0 touch-manipulation ${className}`}
        >
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            {currentVisualization?.icon && (
              <currentVisualization.icon className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-base sm:text-lg font-normal truncate">
              {currentVisualization?.name || t('visualisation.selectVisualisation')}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 sm:w-72 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        {/* Verified Section */}
        {verifiedVisualizations.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover/80 backdrop-blur-sm z-10">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>{t('visualisation.verified')}</span>
            </DropdownMenuLabel>
            {verifiedVisualizations.map((visualization) => (
              <DropdownMenuItem 
                key={visualization.id}
                onClick={() => handleVisualizationClick(visualization.id)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground p-0"
                onSelect={(e: Event) => e.preventDefault()}
              >
                <div className="flex items-start space-x-3 p-3 sm:p-4 w-full touch-manipulation">
                  <div className="flex-shrink-0 mt-0.5">
                    <visualization.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-normal text-sm sm:text-base">
                      {visualization.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {t(`visualization.descriptions.${kebabToCamel(visualization.id)}`)}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* In Progress Section */}
        {inProgressVisualizations.length > 0 && (
          <>
            {verifiedVisualizations.length > 0 && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuLabel className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover/80 backdrop-blur-sm z-10">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{t('visualisation.inProgress')}</span>
            </DropdownMenuLabel>
            {inProgressVisualizations.map((visualization) => (
              <DropdownMenuItem 
                key={visualization.id}
                onClick={() => handleVisualizationClick(visualization.id)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground p-0 opacity-80"
                onSelect={(e: Event) => e.preventDefault()}
              >
                <div className="flex items-start space-x-3 p-3 sm:p-4 w-full touch-manipulation">
                  <div className="flex-shrink-0 mt-0.5">
                    <visualization.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-normal text-sm sm:text-base">
                      {visualization.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {t(`visualization.descriptions.${kebabToCamel(visualization.id)}`)}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 