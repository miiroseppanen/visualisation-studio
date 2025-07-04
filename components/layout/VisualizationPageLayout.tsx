import React from 'react'
import AppLayout from './AppLayout'
import VisualizationLayout from './VisualizationLayout'

interface VisualizationPageLayoutProps {
  children: React.ReactNode
  onReset?: () => void
  onExportSVG?: () => void
  statusContent?: React.ReactNode
  helpText?: string
  settingsContent: React.ReactNode
  panelOpen?: boolean
  onPanelToggle?: () => void
  visualizationNavProps?: {
    showBackButton?: boolean
    backButtonText?: string
    backButtonHref?: string
  }
}

export default function VisualizationPageLayout({
  children,
  onReset,
  onExportSVG,
  statusContent,
  helpText,
  settingsContent,
  panelOpen = true,
  onPanelToggle,
  visualizationNavProps = {}
}: VisualizationPageLayoutProps) {
  return (
    <AppLayout showNavigation={false}>
      <VisualizationLayout
        onReset={onReset}
        onExportSVG={onExportSVG}
        statusContent={statusContent}
        helpText={helpText}
        settingsContent={settingsContent}
        panelOpen={panelOpen}
        onPanelToggle={onPanelToggle}
        visualizationNavProps={visualizationNavProps}
      >
        {children}
      </VisualizationLayout>
    </AppLayout>
  )
} 