import { visualizationOptions, type VisualizationOption } from './navigation-config'
import { getPreviewComponent } from './preview-components'

/**
 * Visualization Manager - Centralized utilities for managing visualizations
 * 
 * This system ensures that:
 * 1. Navigation dropdown and home page stay in sync
 * 2. Adding new visualizations only requires updating navigation-config.ts
 * 3. Preview components are automatically linked
 * 4. Translations are properly handled
 * 5. Visualizations are categorized by status (verified/in-progress)
 */

export interface VisualizationInfo {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: 'field' | 'flow' | 'terrain'
  translationKey: string
  features: string[]
  enabled: boolean
  order: number
  status: 'verified' | 'in-progress'
  hasPreview: boolean
  hasPage: boolean
}

/**
 * Get comprehensive information about all visualizations
 */
export function getAllVisualizationInfo(): VisualizationInfo[] {
  return visualizationOptions.map(viz => ({
    ...viz,
    hasPreview: !!getPreviewComponent(viz.id),
    hasPage: true // Assuming all visualizations in config have pages
  }))
}

/**
 * Get information about a specific visualization
 */
export function getVisualizationInfo(id: string): VisualizationInfo | null {
  const viz = visualizationOptions.find(v => v.id === id)
  if (!viz) return null
  
  return {
    ...viz,
    hasPreview: !!getPreviewComponent(viz.id),
    hasPage: true
  }
}

/**
 * Check if a visualization is properly configured
 */
export function validateVisualization(id: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const viz = visualizationOptions.find(v => v.id === id)
  
  if (!viz) {
    return { isValid: false, issues: [`Visualization with id '${id}' not found in navigation config`] }
  }
  
  // Check if preview component exists
  if (!getPreviewComponent(viz.id)) {
    issues.push(`No preview component found for '${id}'`)
  }
  
  // Check if translation keys are properly formatted
  if (!viz.translationKey) {
    issues.push(`Missing translation key for '${id}'`)
  }
  
  // Check if features array is not empty
  if (!viz.features || viz.features.length === 0) {
    issues.push(`No features defined for '${id}'`)
  }
  
  // Check if status is valid
  if (!viz.status || !['verified', 'in-progress'].includes(viz.status)) {
    issues.push(`Invalid status for '${id}': must be 'verified' or 'in-progress'`)
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Get visualizations by category with validation
 */
export function getVisualizationsByCategoryWithValidation(category: 'field' | 'flow' | 'terrain'): {
  valid: VisualizationInfo[]
  invalid: { id: string; issues: string[] }[]
} {
  const categoryViz = visualizationOptions.filter(viz => viz.category === category)
  const valid: VisualizationInfo[] = []
  const invalid: { id: string; issues: string[] }[] = []
  
  categoryViz.forEach(viz => {
    const validation = validateVisualization(viz.id)
    if (validation.isValid) {
      valid.push(getVisualizationInfo(viz.id)!)
    } else {
      invalid.push({ id: viz.id, issues: validation.issues })
    }
  })
  
  return { valid, invalid }
}

/**
 * Get verified visualizations
 */
export function getVerifiedVisualizations(): VisualizationInfo[] {
  return visualizationOptions
    .filter(viz => viz.enabled && viz.status === 'verified')
    .sort((a, b) => a.order - b.order)
    .map(viz => ({
      ...viz,
      hasPreview: !!getPreviewComponent(viz.id),
      hasPage: true
    }))
}

/**
 * Get in-progress visualizations
 */
export function getInProgressVisualizations(): VisualizationInfo[] {
  return visualizationOptions
    .filter(viz => viz.enabled && viz.status === 'in-progress')
    .sort((a, b) => a.order - b.order)
    .map(viz => ({
      ...viz,
      hasPreview: !!getPreviewComponent(viz.id),
      hasPage: true
    }))
}

/**
 * Get statistics about the visualization system
 */
export function getVisualizationStats() {
  const allViz = getAllVisualizationInfo()
  
  return {
    total: allViz.length,
    enabled: allViz.filter(v => v.enabled).length,
    disabled: allViz.filter(v => !v.enabled).length,
    verified: allViz.filter(v => v.status === 'verified').length,
    inProgress: allViz.filter(v => v.status === 'in-progress').length,
    withPreviews: allViz.filter(v => v.hasPreview).length,
    withoutPreviews: allViz.filter(v => !v.hasPreview).length,
    byCategory: {
      field: allViz.filter(v => v.category === 'field').length,
      flow: allViz.filter(v => v.category === 'flow').length,
      terrain: allViz.filter(v => v.category === 'terrain').length,
    }
  }
}

/**
 * Helper function to add a new visualization
 * This is a template for adding new visualizations
 */
export function addVisualizationTemplate() {
  return `
// To add a new visualization:

// 1. Add to lib/navigation-config.ts:
{
  id: 'new-visualization',
  name: 'New Visualization',
  path: '/new-visualization',
  icon: NewIcon, // Import from lucide-react
  description: 'Description of the new visualization',
  category: 'field', // or 'flow' or 'terrain'
  translationKey: 'newVisualization',
  features: ['feature1', 'feature2', 'feature3'],
  enabled: true,
  order: 12, // Next available number
  status: 'in-progress' // or 'verified' when ready
}

// 2. Add preview component to lib/preview-components.tsx:
export const NewVisualizationPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    {/* Your preview content */}
  </div>
)

// 3. Add to previewComponents mapping:
'new-visualization': NewVisualizationPreview,

// 4. Add translations to lib/locales/en.json and lib/locales/fi.json:
"tools": {
  "newVisualization": {
    "title": "New Visualization",
    "description": "Description of the new visualization",
    "features": {
      "feature1": "Feature 1 description",
      "feature2": "Feature 2 description", 
      "feature3": "Feature 3 description"
    }
  }
}

// 5. Create the page at app/new-visualization/page.tsx

// The system will automatically:
// - Include it in the navigation dropdown (in appropriate section)
// - Show it on the home page (in appropriate section)
// - Handle translations
// - Provide preview component
// - Apply correct styling based on status
`
} 