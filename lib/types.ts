import type { TurbulenceSource } from './turbulence-physics'

export interface GridLine {
  x: number
  y: number
  angle: number
  length: number
  // Bezier curve control points
  startX: number
  startY: number
  controlX1: number
  controlY1: number
  controlX2: number
  controlY2: number
  endX: number
  endY: number
}

// Turbulence-specific line type for streamlines
export interface StreamLine {
  points: { x: number; y: number }[]
  color?: string
  opacity?: number
}

// Flowing particle for turbulence animation
export interface FlowingParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  age: number
  trail: { x: number; y: number }[]
  maxTrailLength: number
}

export interface Pole {
  id: string
  name: string
  x: number
  y: number
  strength: number
  isPositive: boolean
}

export interface FieldVector {
  fieldX: number
  fieldY: number
  angle: number
}

export interface GridSettings {
  spacing: number
  lineLength: number
  type: 'rectangular' | 'triangular' | 'hexagonal' | 'radial' | 'random' | 'spiral'
  curveStiffness: number
  showPoles: boolean
}

// Turbulence-specific settings
export interface TurbulenceSettings {
  lineCount: number
  lineLength: number
  showSources: boolean
  streamlineMode: boolean // true for streamlines, false for grid vectors
  flowingMode: boolean // true for flowing particles, false for static vectors
  streamlineSteps: number // Number of steps for streamlines
  streamlineStepSize: number // Step size for streamlines
  sources: TurbulenceSource[]
}

export interface NoiseSettings {
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  seed: number
}

export interface FlowSettings {
  baseVelocity: number
  baseAngle: number
  enabled: boolean
}

// Topography-specific settings
export interface TopographyDisplaySettings {
  showElevationPoints: boolean
  showContourLines: boolean
  showElevationLabels: boolean
  showGradientField: boolean
  lineWeight: number
  majorContourWeight: number
  majorContourInterval: number
}

export interface TopographyAnimationSettings {
  isAnimating: boolean
  windSpeed: number
  windDirection: number
  time: number
}

// Base animation settings - used by all visualizations
export interface BaseAnimationSettings {
  isAnimating: boolean
  time: number
}

// Grid field animation settings
export interface AnimationSettings extends BaseAnimationSettings {
  windStrength: number
  windSpeed: number
}

// Flow field animation settings
export interface FlowFieldAnimationSettings extends BaseAnimationSettings {
  particleSpeed: number
  particleLife: number
  flowIntensity: number
}

// Turbulence animation settings
export interface TurbulenceAnimationSettings extends BaseAnimationSettings {
  speed: number
  intensity: number
}

// Topography animation settings
export interface TopographyAnimationSettings extends BaseAnimationSettings {
  windSpeed: number
  windDirection: number
  contourPulse: boolean
}

export interface DirectionSettings {
  enabled: boolean
  angle: number
  strength: number
}

export interface PolaritySettings {
  attractToPoles: boolean
}

export interface ZoomSettings {
  level: number
  baseGridSpacing: number
  baseLineLength: number
}

// Grid field panel state
export interface PanelState {
  isOpen: boolean
  gridSettingsExpanded: boolean
  defaultDirectionExpanded: boolean
  polesExpanded: boolean
  animationExpanded: boolean
}

// Flow field panel state
export interface FlowFieldPanelState {
  isOpen: boolean
  fieldSettingsExpanded: boolean
  polesExpanded: boolean
  particleSettingsExpanded: boolean
  animationExpanded: boolean
}

// Turbulence panel state
export interface TurbulencePanelState {
  isOpen: boolean
  turbulenceExpanded: boolean
  sourcesExpanded: boolean
  flowSettingsExpanded: boolean
  noiseExpanded: boolean
  animationExpanded: boolean
}

// Topography panel state
export interface TopographyPanelState {
  isOpen: boolean
  topographySettingsExpanded: boolean
  elevationPointsExpanded: boolean
  contourSettingsExpanded: boolean
  displaySettingsExpanded: boolean
  animationExpanded: boolean
}

// Circular field-specific settings
export interface CircularFieldSettings {
  lineCount: number
  lineSpacing: number
  lineWeight: number
  opacity: number
  showPoles: boolean
  animationSpeed: number
}

// Circular field display settings
export interface CircularFieldDisplaySettings {
  showFieldLines: boolean
  showPoles: boolean
  showPoleLabels: boolean
  lineWeight: number
  opacity: number
}

// Circular field animation settings
export interface CircularFieldAnimationSettings {
  isAnimating: boolean
  rotationSpeed: number
  pulseEffect: boolean
  time: number
}

// Circular field panel state
export interface CircularFieldPanelState {
  isOpen: boolean
  fieldSettingsExpanded: boolean
  polesExpanded: boolean
  displaySettingsExpanded: boolean
  animationExpanded: boolean
}

interface TurbulenceVisualizationSettings extends TurbulenceSettings {
  noiseSettings: NoiseSettings
  flowSettings: FlowSettings
  sources: TurbulenceSource[]
}

// Visualization Suggestion Types
export interface VisualizationSuggestion {
  id: string
  title: string
  description: string
  author: string
  timestamp: Date
  upvotes: number
  downvotes: number
  status: 'pending' | 'approved' | 'implemented' | 'rejected'
  category: string
  complexity: 'low' | 'medium' | 'high' | 'new-visual' | 'bug' | 'improvement' | 'feature' | 'enhancement'
  
  // Implementation details for generating visualizations
  implementation?: {
    type: 'grid-field' | 'flow-field' | 'turbulence' | 'circular-field' | 'topography' | 'particle-swarm' | 'neural-network' | 'wave-interference' | 'cellular-automata' | 'sound-wave' | 'custom'
    baseSettings?: Partial<GridSettings | TurbulenceSettings | CircularFieldSettings | TopographyDisplaySettings | ParticleSwarmSettings | NeuralNetworkSettings | WaveInterferenceSettings | CellularAutomataSettings | SoundWaveSettings>
    animationSettings?: Partial<AnimationSettings | FlowFieldAnimationSettings | TurbulenceAnimationSettings | CircularFieldAnimationSettings | TopographyAnimationSettings | ParticleSwarmAnimationSettings | NeuralNetworkAnimationSettings | WaveInterferenceAnimationSettings | CellularAutomataAnimationSettings | SoundWaveAnimationSettings>
    customParameters?: Record<string, any>
    rendererConfig?: {
      renderer: string
      parameters: Record<string, any>
    }
  }
  
  // Metadata for filtering and organization
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDevTime: number // in hours
  dependencies?: string[]
  
  // User interaction data
  views: number
  favorites: number
  comments: Comment[]
  
  // Version control
  version: string
  lastModified: Date
  createdBy: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  upvotes: number
  downvotes: number
}

export interface SuggestionFilters {
  category?: string
  complexity?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'approved' | 'implemented' | 'rejected'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  search?: string
  sortBy?: 'score' | 'date' | 'title' | 'views' | 'favorites'
  sortOrder?: 'asc' | 'desc'
}

// Wave interference types
export interface WaveInterferenceAnimationSettings extends BaseAnimationSettings {
  speed: number
  waveSpeed: number
}

export interface WaveInterferencePanelState {
  isOpen: boolean
  waveSourcesExpanded: boolean
  waveSettingsExpanded: boolean
  animationExpanded: boolean
}

// Particle swarm types
export interface ParticleSwarmAnimationSettings extends BaseAnimationSettings {
  speed: number
}

export interface ParticleSwarmPanelState {
  isOpen: boolean
  swarmSettingsExpanded: boolean
  behaviorSettingsExpanded: boolean
  animationExpanded: boolean
}



// Neural Network types
export interface NeuralNetworkAnimationSettings extends BaseAnimationSettings {
  pulseSpeed: number
  learningSpeed: number
}

export interface NeuralNetworkPanelState {
  isOpen: boolean
  networkSettingsExpanded: boolean
  trainingExpanded: boolean
  animationExpanded: boolean
}

// Cellular Automata types
export interface CellularAutomataAnimationSettings extends BaseAnimationSettings {
  speed: number
  cellSize: number
}

export interface CellularAutomataPanelState {
  isOpen: boolean
  rulesExpanded: boolean
  patternExpanded: boolean
  animationExpanded: boolean
}

// Sound Wave types
export interface SoundWaveAnimationSettings extends BaseAnimationSettings {
  frequency: number
  amplitude: number
  waveSpeed: number
}

export interface SoundWavePanelState {
  isOpen: boolean
  waveSettingsExpanded: boolean
  frequencyExpanded: boolean
  animationExpanded: boolean
}

// Particle Swarm types
export interface ParticleSwarmSettings {
  particleCount: number
  maxSpeed: number
  neighborRadius: number
  separationWeight: number
  alignmentWeight: number
  cohesionWeight: number
  obstacleAvoidanceWeight: number
}



// Neural Network types
export interface NeuralNetworkSettings {
  layers: number[]
  learningRate: number
  activationFunction: string
}

// Wave Interference types
export interface WaveInterferenceSettings {
  waveCount: number
  amplitude: number
  wavelength: number
}

// Cellular Automata types
export interface CellularAutomataSettings {
  gridSize: number
  cellSize: number
  ruleSet: string
}

// Sound Wave types
export interface SoundWaveSettings {
  frequency: number
  amplitude: number
  waveform: string
}

export interface SuggestionStats {
  total: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  byComplexity: Record<string, number>
  topRated: VisualizationSuggestion[]
  mostViewed: VisualizationSuggestion[]
  recentlyAdded: VisualizationSuggestion[]
} 