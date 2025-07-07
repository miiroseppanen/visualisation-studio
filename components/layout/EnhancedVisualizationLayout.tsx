import React, { useState } from 'react'
import AppLayout from './AppLayout'
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation'
import EnhancedControlsPanel from '@/components/EnhancedControlsPanel'
import { useMobileUI } from '@/lib/hooks/useMobileUI'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface EnhancedVisualizationLayoutProps {
  children: React.ReactNode
  onReset?: () => void
  onExportSVG?: () => void
  statusContent?: React.ReactNode
  helpText?: string
  settingsContent?: React.ReactNode
  panelOpen?: boolean
  onPanelToggle?: () => void
  showVisualizationNav?: boolean
  visualizationNavProps?: {
    showBackButton?: boolean
    backButtonText?: string
    backButtonFallbackPath?: string
    additionalActionButtons?: React.ReactNode
    leftContent?: React.ReactNode
    rightContent?: React.ReactNode
  }
  // Enhanced panel props
  autoHideDelay?: number
  showMinimizeButton?: boolean
  onPanelMinimize?: () => void
  isPanelMinimized?: boolean
}

export default function EnhancedVisualizationLayout({
  children,
  onReset,
  onExportSVG,
  statusContent,
  helpText,
  settingsContent,
  panelOpen = true,
  onPanelToggle,
  showVisualizationNav = true,
  visualizationNavProps = {},
  autoHideDelay = 4000,
  showMinimizeButton = true,
  onPanelMinimize,
  isPanelMinimized = false
}: EnhancedVisualizationLayoutProps) {
  const { t } = useTranslation()
  const { isUIVisible, isMobile, showUI } = useMobileUI()
  const [panelState, setPanelState] = useState({
    isOpen: panelOpen,
    isMinimized: isPanelMinimized
  })

  const handleCanvasClick = () => {
    if (!isUIVisible) {
      showUI()
    }
  }

  const handlePanelToggle = () => {
    const newState = { ...panelState, isOpen: !panelState.isOpen }
    setPanelState(newState)
    if (onPanelToggle) {
      onPanelToggle()
    }
  }

  const handlePanelMinimize = () => {
    const newState = { ...panelState, isMinimized: !panelState.isMinimized }
    setPanelState(newState)
    if (onPanelMinimize) {
      onPanelMinimize()
    }
  }

  return (
    <AppLayout showNavigation={false}>
      <div className="h-screen w-screen flex flex-col">
        {/* Enhanced Visualization Navigation */}
        {showVisualizationNav && (
          <div className={cn(
            "w-full transition-all duration-300 ease-in-out",
            isUIVisible ? "opacity-100 translate-y-0" : "opacity-20 -translate-y-0"
          )}>
            <EnhancedNavigation 
              pageType="visualization"
              onReset={onReset}
              onExportSVG={onExportSVG}
              showBackButton={isUIVisible ? visualizationNavProps.showBackButton : false}
              backButtonText={visualizationNavProps.backButtonText}
              backButtonFallback={visualizationNavProps.backButtonFallbackPath}
              additionalActionButtons={isUIVisible ? visualizationNavProps.additionalActionButtons : undefined}
              hideNonEssential={!isUIVisible}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas Container */}
          <div 
            className="w-full h-full relative"
            onClick={handleCanvasClick}
          >
            {children}
          </div>

          {/* Status Overlay */}
          {statusContent && (
            <div className={cn(
              "fixed top-20 left-4 z-40 pointer-events-none transition-all duration-300 ease-in-out",
              isUIVisible ? "opacity-100" : "opacity-0"
            )}>
              <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground">
                {statusContent}
              </div>
            </div>
          )}

          {/* Help Overlay */}
          {helpText && (
            <div className={cn(
              "fixed bottom-4 left-4 z-40 pointer-events-none transition-all duration-300 ease-in-out",
              isUIVisible ? "opacity-100" : "opacity-0"
            )}>
              <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground max-w-md">
                {helpText}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Settings Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isUIVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {settingsContent && (
            <EnhancedControlsPanel 
              title={t('navigation.settings')} 
              isOpen={panelState.isOpen} 
              onToggle={handlePanelToggle}
              autoHideDelay={autoHideDelay}
              showMinimizeButton={showMinimizeButton}
              onMinimize={handlePanelMinimize}
              isMinimized={panelState.isMinimized}
            >
              <div className="pb-8 md:pb-12">
                {settingsContent}
              </div>
            </EnhancedControlsPanel>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 