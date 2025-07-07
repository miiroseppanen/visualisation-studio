import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getVisualizationsForHomePage, getVerifiedVisualizations, getInProgressVisualizations, type VisualizationOption } from '../navigation-config'
import { getPreviewComponent } from '../preview-components'

export interface HomePageVisualization {
  id: string
  title: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  features: string[]
  preview: React.ComponentType
  category: 'field' | 'flow' | 'terrain'
  order: number
  status: 'verified' | 'in-progress'
}

export function useHomePageVisualizations(): {
  allVisualizations: HomePageVisualization[]
  verifiedVisualizations: HomePageVisualization[]
  inProgressVisualizations: HomePageVisualization[]
} {
  const { t } = useTranslation()
  
  const transformVisualization = (viz: VisualizationOption): HomePageVisualization => {
    const PreviewComponent = getPreviewComponent(viz.id)
    
    return {
      id: viz.id,
      title: t(`tools.${viz.translationKey}.title`),
      path: viz.path,
      icon: viz.icon,
      description: t(`tools.${viz.translationKey}.description`),
      features: viz.features.map(feature => t(`tools.${viz.translationKey}.features.${feature}`)),
      preview: PreviewComponent,
      category: viz.category,
      order: viz.order,
      status: viz.status
    }
  }
  
  const allVisualizations = useMemo(() => {
    const visualizations = getVisualizationsForHomePage()
    return visualizations.map(transformVisualization)
  }, [t])
  
  const verifiedVisualizations = useMemo(() => {
    const visualizations = getVerifiedVisualizations()
    return visualizations.map(transformVisualization)
  }, [t])
  
  const inProgressVisualizations = useMemo(() => {
    const visualizations = getInProgressVisualizations()
    return visualizations.map(transformVisualization)
  }, [t])
  
  return {
    allVisualizations,
    verifiedVisualizations,
    inProgressVisualizations
  }
} 