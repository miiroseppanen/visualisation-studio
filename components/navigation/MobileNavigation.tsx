'use client'

import React, { useState } from 'react'
import { Menu, X, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { useVisualizationNavigation } from '@/lib/hooks/useVisualizationNavigation'
import NavigationBackButton from './NavigationBackButton'
import NavigationActionButtons from './NavigationActionButtons'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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
  const { currentVisualization, allVisualizations, verifiedVisualizations, inProgressVisualizations, navigateToVisualization } = useVisualizationNavigation()
  useBodyScrollLock(isMenuOpen);

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
    <div className={`md:hidden w-full ${className}`} style={{margin: 0, borderRadius: 0}}>
      <div className="w-full border-b border-border/30 bg-background/60 backdrop-blur-md transition-all duration-300 dark:bg-background/40" style={{margin: 0, borderRadius: 0, padding: 0}}>
        {/* Mobile Header */}
        {hideNonEssential ? (
          <div className="flex items-center px-4 py-2 min-h-10 mt-2" style={{minHeight: '2.5rem', marginLeft: '0.5rem'}}>
            {currentVisualization?.icon && (
              <currentVisualization.icon className="w-5 h-5 flex-shrink-0 mr-2" />
            )}
            <span className="text-base font-medium leading-tight truncate">
              {currentVisualization?.name || 'Visualisation'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1.5 min-h-10" style={{minHeight: '2.5rem'}}>
            <div className="flex items-center space-x-2 min-w-0">
              {showBackButton && (
              <NavigationBackButton 
                onBack={handleBackClick}
                text=""
                className="p-2 min-w-0"
              />
            )}
              {currentVisualization?.icon && (
                <currentVisualization.icon className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-base font-medium leading-tight truncate">
                {currentVisualization?.name || 'Visualisation'}
                </span>
            </div>
            <div className="flex items-center space-x-1">
              <NavigationActionButtons
                onReset={onReset}
                onExportSVG={onExportSVG}
                className="flex-shrink-0"
                hideNonEssential={hideNonEssential}
              />
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
            </div>
          </div>
        )}
        {/* Mobile Menu */}
        {isMenuOpen && !hideNonEssential && (
          <div className="border-t border-border/40 bg-background/70 backdrop-blur-md" style={{borderRadius: 0}}>
            <div className="px-2 py-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Switch Visualisation
                  </h3>
                  {/* Verified Section */}
                  {verifiedVisualizations.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Verified</span>
                      </div>
                      {verifiedVisualizations.map((visualization) => (
                        <button
                          key={visualization.id}
                          onClick={() => handleVisualizationSelect(visualization.id)}
                          className={`w-full text-left p-2 transition-colors ${
                            currentVisualization?.id === visualization.id
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
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
                  )}
                  {/* In Progress Section */}
                  {inProgressVisualizations.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>In Progress</span>
                      </div>
                      {inProgressVisualizations.map((visualization) => (
                        <button
                          key={visualization.id}
                          onClick={() => handleVisualizationSelect(visualization.id)}
                          className={`w-full text-left p-2 transition-colors opacity-80 ${
                            currentVisualization?.id === visualization.id
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
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
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 