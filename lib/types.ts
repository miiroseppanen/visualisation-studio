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
  type: 'rectangular' | 'triangular'
  curveStiffness: number
  showPoles: boolean
}

// Turbulence-specific settings
export interface TurbulenceSettings {
  lineCount: number
  lineLength: number
  showSources: boolean
  streamlineMode: boolean // true for streamlines, false for grid vectors
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
  gridSettingsExpanded: boolean
  defaultDirectionExpanded: boolean
  polesExpanded: boolean
  animationExpanded: boolean
}

// Flow field panel state
export interface FlowFieldPanelState {
  fieldSettingsExpanded: boolean
  polesExpanded: boolean
  particleSettingsExpanded: boolean
  animationExpanded: boolean
}

// Turbulence panel state
export interface TurbulencePanelState {
  turbulenceExpanded: boolean
  sourcesExpanded: boolean
  flowSettingsExpanded: boolean
  noiseExpanded: boolean
  animationExpanded: boolean
}

// Topography panel state
export interface TopographyPanelState {
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
  fieldSettingsExpanded: boolean
  polesExpanded: boolean
  displaySettingsExpanded: boolean
  animationExpanded: boolean
} 