'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { useVisualizationNavigation } from '@/lib/hooks/useVisualizationNavigation'
import NavigationBackButton from './NavigationBackButton'
import NavigationActionButtons from './NavigationActionButtons'

interface MobileNavigationProps {
  onReset?: () => void
  onExportSVG?: () => void
  additionalActionButtons?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  className?: string
  hideNonEssential?: boolean
}

/**
 * Mobile navigation component
 * Simplified mobile-first design with collapsible menu
 */
export default function MobileNavigation({
  onReset,
  onExportSVG,
  additionalActionButtons,
  showBackButton = true,
  backButtonText = 'Home',
  backButtonFallback = '/',
  className = '',
  hideNonEssential = false
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { navigateHome } = useNavigation()
  const { currentVisualization, allVisualizations, navigateToVisualization } = useVisualizationNavigation()

  const handleBackClick = () => {
    navigateHome()
  }

  const handleVisualizationSelect = (id: string) => {
    navigateToVisualization(id)
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className={`md:hidden ${className}`}>
      <div className="m-4 rounded-lg border border-border/30 bg-background/60 backdrop-blur-md hover:bg-background/80 hover:backdrop-blur-lg transition-all duration-300 dark:bg-background/40 dark:hover:bg-background/60">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            {showBackButton && !hideNonEssential && (
              <NavigationBackButton 
                onBack={handleBackClick}
                text=""
                className="p-2 min-w-0"
              />
            )}
            
            <div className="flex items-center space-x-2 min-w-0">
              {currentVisualization?.icon && (
                <currentVisualization.icon className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-base font-medium truncate">
                {currentVisualization?.name || 'Visualization'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!hideNonEssential && (
              <NavigationActionButtons
                onReset={onReset}
                onExportSVG={onExportSVG}
                className="flex-shrink-0"
                hideNonEssential={hideNonEssential}
              />
            )}
            
            {!hideNonEssential && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="p-2 min-w-0"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && !hideNonEssential && (
          <div className="border-t border-border/40 bg-background/70 backdrop-blur-md rounded-b-xl dark:bg-background/50">
            <div className="px-4 py-3 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Switch Visualization
                  </h3>
                  <div className="space-y-2">
                    {allVisualizations.map((visualization) => (
                      <button
                        key={visualization.id}
                        onClick={() => handleVisualizationSelect(visualization.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentVisualization?.id === visualization.id
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <visualization.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {visualization.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {visualization.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {additionalActionButtons && (
                  <div className="pt-3 border-t border-border/20">
                    <div className="flex flex-col space-y-2">
                      {additionalActionButtons}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 