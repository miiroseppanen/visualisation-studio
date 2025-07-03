import React from 'react'
import { RotateCcw, Download } from 'lucide-react'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'
import { Button } from '@/components/ui/button'

interface VisualizationLayoutProps {
  children: React.ReactNode
  onReset?: () => void
  onExportSVG?: () => void
  statusContent?: React.ReactNode
  helpText?: string
  settingsContent: React.ReactNode
}

export default function VisualizationLayout({
  children,
  onReset,
  onExportSVG,
  statusContent,
  helpText,
  settingsContent
}: VisualizationLayoutProps) {
  const actionButtons = (
    <>
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      )}
      {onExportSVG && (
        <Button size="sm" onClick={onExportSVG}>
          <Download className="w-4 h-4 mr-2" />
          SVG
        </Button>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <VisualizationNav actionButtons={actionButtons} />
      
      {/* Main Content Area */}
      <main className="relative">
        {/* Canvas/Visualization Content */}
        <div className="w-full h-screen">
          {children}
        </div>
        
        {/* Status Display */}
        {statusContent && (
          <div className="fixed top-24 left-4 z-40 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground">
              {statusContent}
            </div>
          </div>
        )}
        
        {/* Help Text */}
        {helpText && (
          <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground max-w-md">
              {helpText}
            </div>
          </div>
        )}
      </main>
      
      {/* Settings Panel */}
      <ControlsPanel title="Settings">
        {settingsContent}
      </ControlsPanel>
    </div>
  )
} 