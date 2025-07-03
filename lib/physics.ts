import type { Pole, FieldVector, DirectionSettings, PolaritySettings } from './types'
import { 
  POLE_FORCE_MULTIPLIER, 
  DISTANCE_OFFSET, 
  WIND_MULTIPLIER,
  WIND_WAVE_FREQUENCIES 
} from './constants'

/**
 * Calculate the magnetic field vector at a given point
 */
export function calculateFieldAt(
  x: number, 
  y: number, 
  poles: Pole[], 
  directionSettings: DirectionSettings,
  polaritySettings: PolaritySettings,
  time: number,
  windStrength: number
): FieldVector {
  let fieldX = 0
  let fieldY = 0
  
  // Apply default direction if enabled
  if (directionSettings.enabled) {
    const angleRad = (directionSettings.angle * Math.PI) / 180
    fieldX = Math.cos(angleRad) * directionSettings.strength
    fieldY = Math.sin(angleRad) * directionSettings.strength
  }

  // Calculate influence from each pole
  poles.forEach(pole => {
    const dx = pole.x - x
    const dy = pole.y - y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 1) { // Avoid division by zero
      // Calculate force strength with gentler falloff
      const forceStrength = (pole.strength * POLE_FORCE_MULTIPLIER) / (distance * DISTANCE_OFFSET + 1)
      
      // Calculate unit vector - direction depends on both global mode and individual polarity
      let unitX, unitY
      
      // Determine final polarity: combine global mode with individual pole polarity
      const effectivePolarity = polaritySettings.attractToPoles ? pole.isPositive : !pole.isPositive
      
      if (effectivePolarity) {
        // Attractive: point toward the pole
        unitX = dx / distance
        unitY = dy / distance
      } else {
        // Repulsive: point away from the pole
        unitX = -dx / distance
        unitY = -dy / distance
      }
      
      // Apply force in the calculated direction
      fieldX += unitX * forceStrength
      fieldY += unitY * forceStrength
    }
  })

  // Add wind effects
  const windEffect = calculateWindEffect(x, y, time, windStrength)
  fieldX += windEffect.x
  fieldY += windEffect.y

  return { 
    fieldX, 
    fieldY, 
    angle: Math.atan2(fieldY, fieldX) 
  }
}

/**
 * Calculate wind effects for realistic field perturbations
 */
export function calculateWindEffect(
  x: number,
  y: number, 
  time: number,
  windStrength: number
): { x: number; y: number } {
  const { primary, secondary, tertiary, quaternary } = WIND_WAVE_FREQUENCIES
  
  const windX = (
    Math.cos(time * primary.time + x * primary.x + y * primary.y) * primary.amplitude +
    Math.cos(time * secondary.time + x * secondary.x - y * secondary.y) * secondary.amplitude
  ) * windStrength * WIND_MULTIPLIER
  
  const windY = (
    Math.sin(time * tertiary.time + x * tertiary.x + y * tertiary.y) * tertiary.amplitude +
    Math.sin(time * quaternary.time + y * quaternary.x - x * quaternary.y) * quaternary.amplitude
  ) * windStrength * WIND_MULTIPLIER
  
  return { x: windX, y: windY }
}

/**
 * Generate a unique ID for new poles
 */
export function generatePoleId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Generate pole name based on current count
 */
export function generatePoleName(poleCount: number): string {
  return `Pole ${poleCount + 1}`
}

/**
 * Check if a point is within a pole's click radius
 */
export function isPoleClicked(
  clickX: number, 
  clickY: number, 
  pole: Pole, 
  clickRadius: number = 20
): boolean {
  const distance = Math.sqrt((pole.x - clickX) ** 2 + (pole.y - clickY) ** 2)
  return distance <= clickRadius
}

/**
 * Renumber poles after removal to maintain sequential naming
 */
export function renumberPoles(poles: Pole[]): Pole[] {
  return poles.map((pole, index) => ({
    ...pole,
    name: `Pole ${index + 1}`
  }))
} 