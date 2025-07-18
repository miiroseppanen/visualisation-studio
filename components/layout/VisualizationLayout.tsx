import React from 'react'
import AppLayout from './AppLayout'
import { SimpleNavigation } from '@/components/navigation'
import ControlsPanel from '@/components/ControlsPanel'
import { useMobileUI } from '@/lib/hooks/useMobileUI'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface VisualizationLayoutProps {
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
}

export default function VisualizationLayout({
  children,
  onReset,
  onExportSVG,
  statusContent,
  helpText,
  settingsContent,
  panelOpen = true,
  onPanelToggle,
  showVisualizationNav = true,
  visualizationNavProps = {}
}: VisualizationLayoutProps) {
  const { isUIVisible, isMobile, showUI } = useMobileUI()

  const handleCanvasClick = () => {
    if (!isUIVisible) {
      showUI()
    }
  }

  return (
    <AppLayout showNavigation={false}>
      <div className="h-screen w-screen flex flex-col">
        {/* Visualization Navigation */}
        {showVisualizationNav && (
          <div className={cn(
            "w-full h-14 z-50 transition-all duration-300 ease-in-out",
            isUIVisible ? "opacity-100 translate-y-0" : "opacity-20 -translate-y-0"
          )}>
            <SimpleNavigation 
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
        <main className="flex-1 flex flex-col relative w-full h-full">
          <div 
            className="flex-1 w-full h-full relative cursor-pointer"
            style={{ minHeight: '0', minWidth: '0' }}
            onClick={handleCanvasClick}
          >
            {children}
          </div>

          {/* Status Display */}
          <div className={cn(
            "absolute top-2 sm:top-4 left-2 sm:left-4 z-40 pointer-events-none transition-all duration-500 ease-in-out",
            statusContent && panelOpen && isUIVisible
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}>
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-muted-foreground max-w-[calc(100vw-2rem)] sm:max-w-none">
              <div className="line-clamp-2 sm:line-clamp-none">
                {statusContent}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className={cn(
            "absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-40 pointer-events-none transition-all duration-500 ease-in-out",
            helpText && panelOpen && isUIVisible
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-2 pointer-events-none"
          )}>
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-muted-foreground max-w-[calc(100vw-2rem)] sm:max-w-md">
              <div className="line-clamp-3 sm:line-clamp-none">
                {helpText}
              </div>
            </div>
          </div>
        </main>

        {/* Settings Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isUIVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {settingsContent && (
            <ControlsPanel 
              title="Settings" 
              isOpen={panelOpen} 
              onToggle={onPanelToggle}
            >
              <div className="pb-8 md:pb-12">
                {settingsContent}
              </div>
            </ControlsPanel>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 