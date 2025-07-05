import React from 'react'
import AppLayout from './AppLayout'
import { SimpleNavigation } from '@/components/navigation'
import ControlsPanel from '@/components/ControlsPanel'
import { useMobileUI } from '@/lib/hooks/useMobileUI'
import { cn } from '@/lib/utils'

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
  const { isUIVisible, isMobile } = useMobileUI()

  return (
    <AppLayout showNavigation={false}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Visualization Navigation */}
        {showVisualizationNav && (
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isUIVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
          )}>
            <SimpleNavigation 
              onReset={onReset}
              onExportSVG={onExportSVG}
              showBackButton={visualizationNavProps.showBackButton}
              backButtonText={visualizationNavProps.backButtonText}
              backButtonFallback={visualizationNavProps.backButtonFallbackPath}
              additionalActionButtons={visualizationNavProps.additionalActionButtons}
            />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative">
          {/* Canvas/Visualization Content */}
          <div className="flex-1 w-full relative min-h-0 canvas-container">
            {children}
          </div>

          {/* Status Display - Mobile responsive */}
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

          {/* Help Text - Mobile responsive */}
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

          {/* Mobile UI Indicator */}
          {isMobile && !isUIVisible && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="bg-black/20 backdrop-blur-sm rounded-full p-3 dark:bg-white/20">
                <div className="w-2 h-2 bg-white rounded-full dark:bg-black"></div>
              </div>
            </div>
          )}
        </main>

        {/* Settings Panel - Mobile responsive */}
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
              {settingsContent}
            </ControlsPanel>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 