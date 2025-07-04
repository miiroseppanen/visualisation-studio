import { Grid3X3, Magnet, Wind, Mountain, Radio } from 'lucide-react'

export interface VisualizationOption {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: 'field' | 'flow' | 'terrain'
}

export const visualizationOptions: VisualizationOption[] = [
  {
    id: 'grid-field',
    name: 'Grid Field',
    path: '/grid-field',
    icon: Grid3X3,
    description: 'Create a field of lines that respond to magnetic poles',
    category: 'field'
  },
  {
    id: 'flow-field',
    name: 'Flow Field',
    path: '/flow-field',
    icon: Magnet,
    description: 'Design magnetic field illustrations with custom poles',
    category: 'field'
  },
  {
    id: 'circular-field',
    name: 'Circular Field',
    path: '/circular-field',
    icon: Radio,
    description: 'Visualize circular field lines around magnetic poles',
    category: 'field'
  },
  {
    id: 'turbulence',
    name: 'Turbulence',
    path: '/turbulence',
    icon: Wind,
    description: 'Explore turbulent flow fields with vortices and noise',
    category: 'flow'
  },
  {
    id: 'topography',
    name: 'Topography',
    path: '/topography',
    icon: Mountain,
    description: 'Generate topographic contour lines from elevation points',
    category: 'terrain'
  }
]

export const getVisualizationById = (id: string): VisualizationOption | undefined => {
  return visualizationOptions.find(viz => viz.id === id)
}

export const getVisualizationByPath = (path: string): VisualizationOption | undefined => {
  return visualizationOptions.find(viz => viz.path === path)
}

export const getVisualizationsByCategory = (category: 'field' | 'flow' | 'terrain'): VisualizationOption[] => {
  return visualizationOptions.filter(viz => viz.category === category)
} 