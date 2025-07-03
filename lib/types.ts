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

export interface AnimationSettings {
  isAnimating: boolean
  windStrength: number
  windSpeed: number
  time: number
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

export interface PanelState {
  gridSettingsExpanded: boolean
  defaultDirectionExpanded: boolean
  polesExpanded: boolean
  animationExpanded: boolean
} 