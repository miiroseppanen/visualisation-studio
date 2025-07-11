import { Grid3X3, Magnet, Wind, Mountain, Radio, Waves, Users, Brain, Grid, Volume2, Zap } from 'lucide-react'

export interface VisualizationOption {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: 'field' | 'flow' | 'terrain'
  // Additional properties for home page
  translationKey: string
  features: string[]
  enabled: boolean
  order: number
  status: 'verified' | 'in-progress'
}

export const visualizationOptions: VisualizationOption[] = [
  {
    id: 'mathematical-lines',
    name: 'Mathematical Lines',
    path: '/mathematical-lines',
    icon: Zap,
    description: 'Interactive mathematical line patterns with harmonic, fractal, and spiral functions',
    category: 'field',
    translationKey: 'mathematicalLines',
    features: ['harmonicPatterns', 'fractalGeometry', 'spiralCompositions', 'interactiveResponse'],
    enabled: true,
    order: 12,
    status: 'verified'
  },
  {
    id: 'grid-field',
    name: 'Grid Field',
    path: '/grid-field',
    icon: Grid3X3,
    description: 'Create a field of lines that respond to magnetic poles',
    category: 'field',
    translationKey: 'gridField',
    features: ['gridControl', 'linePatterns', 'scalableGeometry'],
    enabled: true,
    order: 1,
    status: 'verified'
  },
  {
    id: 'flow-field',
    name: 'Flow Field',
    path: '/flow-field',
    icon: Magnet,
    description: 'Design magnetic field illustrations with custom poles',
    category: 'field',
    translationKey: 'flowField',
    features: ['motionPatterns', 'trailEffects', 'flowLines'],
    enabled: true,
    order: 2,
    status: 'in-progress'
  },
  {
    id: 'turbulence',
    name: 'Turbulence',
    path: '/turbulence',
    icon: Wind,
    description: 'Explore turbulent flow fields with vortices and noise',
    category: 'flow',
    translationKey: 'turbulence',
    features: ['vortexGeneration', 'turbulentTextures', 'noiseVariation'],
    enabled: true,
    order: 3,
    status: 'verified'
  },
  {
    id: 'topography',
    name: 'Topography',
    path: '/topography',
    icon: Mountain,
    description: 'Generate topographic contour lines from elevation points',
    category: 'terrain',
    translationKey: 'topography',
    features: ['contourLines', 'elevationPatterns', 'depthVisualization'],
    enabled: true,
    order: 4,
    status: 'verified'
  },
  {
    id: 'circular-field',
    name: 'Circular Field',
    path: '/circular-field',
    icon: Radio,
    description: 'Visualize circular field lines around magnetic poles',
    category: 'field',
    translationKey: 'circularField',
    features: ['concentricRings', 'radialControl', 'circularCompositions'],
    enabled: true,
    order: 5,
    status: 'in-progress'
  },
  {
    id: 'wave-interference',
    name: 'Wave Interference',
    path: '/wave-interference',
    icon: Waves,
    description: 'Explore wave interference patterns with multiple sources',
    category: 'field',
    translationKey: 'waveInterference',
    features: ['waveSources', 'interferencePatterns', 'harmonicAnalysis'],
    enabled: true,
    order: 6,
    status: 'verified'
  },
  {
    id: 'wave-interference-2',
    name: 'Wave Interference 2',
    path: '/wave-interference-2',
    icon: Waves,
    description: 'Advanced wave interference with complex patterns and harmonics',
    category: 'field',
    translationKey: 'waveInterference2',
    features: ['quantumParticles', 'waveFunctionCollapse', 'experimentalPatterns'],
    enabled: true,
    order: 7,
    status: 'in-progress'
  },
  {
    id: 'particle-swarm',
    name: 'Particle Swarm',
    path: '/particle-swarm',
    icon: Users,
    description: 'Watch particles flock and swarm with emergent behavior',
    category: 'flow',
    translationKey: 'particleSwarm',
    features: ['flockingBehavior', 'collectiveIntelligence', 'dynamicAttractors'],
    enabled: true,
    order: 8,
    status: 'in-progress'
  },
  {
    id: 'neural-network',
    name: 'Neural Network',
    path: '/neural-network',
    icon: Brain,
    description: 'Interactive neural network with animated connections and learning',
    category: 'flow',
    translationKey: 'neuralNetwork',
    features: ['networkVisualization', 'activationPatterns', 'learningSimulation'],
    enabled: true,
    order: 9,
    status: 'in-progress'
  },
  {
    id: 'cellular-automata',
    name: 'Cellular Automata',
    path: '/cellular-automata',
    icon: Grid,
    description: "Conway's Game of Life with custom rules and patterns",
    category: 'field',
    translationKey: 'cellularAutomata',
    features: ['emergentBehavior', 'ruleBased', 'complexPatterns'],
    enabled: true,
    order: 10,
    status: 'in-progress'
  },
  {
    id: 'sound-wave',
    name: 'Sound Wave',
    path: '/sound-wave',
    icon: Volume2,
    description: 'Real-time audio waveform with frequency analysis',
    category: 'flow',
    translationKey: 'soundWave',
    features: ['waveformAnalysis', 'harmonicVisualization', 'frequencySpectrum'],
    enabled: true,
    order: 11,
    status: 'in-progress'
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

export const getEnabledVisualizations = (): VisualizationOption[] => {
  return visualizationOptions.filter(viz => viz.enabled).sort((a, b) => a.order - b.order)
}

export const getVisualizationsForNavigation = (): VisualizationOption[] => {
  return getEnabledVisualizations()
}

export const getVisualizationsForHomePage = (): VisualizationOption[] => {
  return getEnabledVisualizations()
}

export const getVerifiedVisualizations = (): VisualizationOption[] => {
  return visualizationOptions.filter(viz => viz.enabled && viz.status === 'verified').sort((a, b) => a.order - b.order)
}

export const getInProgressVisualizations = (): VisualizationOption[] => {
  return visualizationOptions.filter(viz => viz.enabled && viz.status === 'in-progress').sort((a, b) => a.order - b.order)
} 