// Default values for grid settings
export const DEFAULT_GRID_SPACING = 30
export const DEFAULT_LINE_LENGTH = 20
export const DEFAULT_CURVE_STIFFNESS = 0.3

// Grid spacing constraints
export const MIN_GRID_SPACING = 10
export const MAX_GRID_SPACING = 120
export const GRID_SPACING_STEP = 5

// Line length constraints
export const MIN_LINE_LENGTH = 5
export const MAX_LINE_LENGTH = 100
export const LINE_LENGTH_STEP = 1

// Curve stiffness constraints
export const MIN_CURVE_STIFFNESS = 0
export const MAX_CURVE_STIFFNESS = 100
export const CURVE_STIFFNESS_STEP = 1

// Color palette for visualizations
export const COLOR_PALETTE = {
  // Primary colors for poles and sources
  positive: '#EF4444',    // Red for positive/north poles
  negative: '#3B82F6',    // Blue for negative/south poles
  neutral: '#6B7280',     // Gray for neutral elements
  
  // Extended palette with pale green
  paleGreen: '#86EFAC',   // Pale green for additional elements
  
  // Source type colors
  vortex: '#3B82F6',      // Blue for rotational flow
  source: '#3B82F6',      // Blue for outward flow
  sink: '#EF4444',        // Red for inward flow
  uniform: '#86EFAC',     // Pale green for uniform flow
  
  // Topography colors
  peak: '#3B82F6',        // Blue for peaks
  valley: '#EF4444',      // Red for valleys
  saddle: '#6B7280',      // Gray for saddles
  ridge: '#6B7280'        // Gray for ridges
} as const

// Pastel color palette for visualizations
export const PASTEL_COLOR_PALETTE = {
  // Primary colors for poles and sources
  positive: '#FF6B6B',    // Vibrant coral for positive/north poles
  negative: '#4ECDC4',    // Vibrant teal for negative/south poles
  neutral: '#A8E6CF',     // Vibrant mint for neutral elements
  
  // Extended palette with vibrant colors
  paleGreen: '#96CEB4',   // Vibrant sage for additional elements
  
  // Source type colors
  vortex: '#4ECDC4',      // Vibrant teal for rotational flow
  source: '#4ECDC4',      // Vibrant teal for outward flow
  sink: '#FF6B6B',        // Vibrant coral for inward flow
  uniform: '#96CEB4',     // Vibrant sage for uniform flow
  
  // Topography colors
  peak: '#4ECDC4',        // Vibrant teal for peaks
  valley: '#FF6B6B',      // Vibrant coral for valleys
  saddle: '#A8E6CF',      // Vibrant mint for saddles
  ridge: '#A8E6CF'        // Vibrant mint for ridges
} as const

// Helper function to get appropriate color palette based on theme
export function getColorPalette(theme: 'light' | 'dark' | 'pastel') {
  return theme === 'pastel' ? PASTEL_COLOR_PALETTE : COLOR_PALETTE;
}

// Turbulence-specific constants
export const DEFAULT_TURBULENCE_LINE_LENGTH = 60 // Longer default for turbulence
export const MIN_TURBULENCE_LINE_LENGTH = 10
export const MAX_TURBULENCE_LINE_LENGTH = 200
export const TURBULENCE_LINE_LENGTH_STEP = 5

export const DEFAULT_TURBULENCE_LINE_COUNT = 2000 // More dense default
export const MIN_TURBULENCE_LINE_COUNT = 500
export const MAX_TURBULENCE_LINE_COUNT = 10000
export const TURBULENCE_LINE_COUNT_STEP = 100

export const DEFAULT_STREAMLINE_STEPS = 150 // Longer streamlines
export const MIN_STREAMLINE_STEPS = 50
export const MAX_STREAMLINE_STEPS = 500
export const STREAMLINE_STEPS_STEP = 10

export const DEFAULT_STREAMLINE_STEP_SIZE = 3 // Larger step size for longer lines
export const MIN_STREAMLINE_STEP_SIZE = 1
export const MAX_STREAMLINE_STEP_SIZE = 10
export const STREAMLINE_STEP_SIZE_STEP = 0.5

// Animation defaults
export const DEFAULT_WIND_STRENGTH = 0.3
export const DEFAULT_WIND_SPEED = 0.3
export const MIN_WIND_STRENGTH = 0
export const MAX_WIND_STRENGTH = 1
export const MIN_WIND_SPEED = 0.1
export const MAX_WIND_SPEED = 3

// Direction defaults
export const DEFAULT_DIRECTION_ANGLE = 0
export const DEFAULT_DIRECTION_STRENGTH = 0.005
export const MIN_DIRECTION_STRENGTH = 0.001
export const MAX_DIRECTION_STRENGTH = 0.1

// Pole defaults
export const DEFAULT_POLE_STRENGTH = 25
export const MIN_POLE_STRENGTH = 1
export const MAX_POLE_STRENGTH = 200
export const POLE_STRENGTH_STEP = 1

// Zoom defaults
export const DEFAULT_ZOOM_LEVEL = 1
export const MIN_ZOOM_LEVEL = 0.1
export const MAX_ZOOM_LEVEL = 5
export const ZOOM_SENSITIVITY = 0.001

// Physics constants
export const POLE_FORCE_MULTIPLIER = 0.01
export const DISTANCE_OFFSET = 0.1
export const WIND_MULTIPLIER = 0.02
export const POLE_CLICK_RADIUS = 20
export const POLE_VISUAL_RADIUS = 8

// Animation frame rate
export const ANIMATION_FPS = 60
export const FRAME_TIME = 0.016 // 1/60

// Wind effect constants
export const WIND_WAVE_FREQUENCIES = {
  primary: { time: 0.5, x: 0.003, y: 0.002, amplitude: 0.6 },
  secondary: { time: 0.3, x: 0.001, y: -0.001, amplitude: 0.4 },
  tertiary: { time: 0.4, x: 0.002, y: 0.003, amplitude: 0.6 },
  quaternary: { time: 0.6, x: -0.001, y: 0.001, amplitude: 0.4 }
}

// Canvas settings
export const CANVAS_DPR_MULTIPLIER = 1
export const OVERLAY_OPACITY = 0.8

// Default initial pole
export const INITIAL_POLE = {
  id: '1',
  name: 'Pole 1',
  x: 400,
  y: 300,
  strength: DEFAULT_POLE_STRENGTH,
  isPositive: true
} 