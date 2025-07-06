import { Grid3X3, Magnet, Wind, Mountain, Radio, Waves, Users, Brain, Grid, Volume2 } from 'lucide-react'

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
    id: 'wave-interference',
    name: 'Wave Interference',
    path: '/wave-interference',
    icon: Waves,
    description: 'Explore wave interference patterns with multiple sources',
    category: 'field'
  },
  {
    id: 'wave-interference-2',
    name: 'Wave Interference 2',
    path: '/wave-interference-2',
    icon: Waves,
    description: 'Advanced wave interference with complex patterns and harmonics',
    category: 'field'
  },
  {
    id: 'particle-swarm',
    name: 'Particle Swarm',
    path: '/particle-swarm',
    icon: Users,
    description: 'Watch particles flock and swarm with emergent behavior',
    category: 'flow'
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
  },
  {
    id: 'neural-network',
    name: 'Neural Network',
    path: '/neural-network',
    icon: Brain,
    description: 'Interactive neural network with animated connections and learning',
    category: 'flow'
  },
  {
    id: 'cellular-automata',
    name: 'Cellular Automata',
    path: '/cellular-automata',
    icon: Grid,
    description: "Conway's Game of Life with custom rules and patterns",
    category: 'field'
  },
  {
    id: 'sound-wave',
    name: 'Sound Wave',
    path: '/sound-wave',
    icon: Volume2,
    description: 'Real-time audio waveform with frequency analysis',
    category: 'flow'
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