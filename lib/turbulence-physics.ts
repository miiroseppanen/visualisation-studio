import type { FieldVector, FlowingParticle } from './types'

export interface TurbulenceSource {
  id: string
  name: string
  x: number
  y: number
  strength: number
  type: 'vortex' | 'source' | 'sink' | 'uniform'
  angle: number // For uniform flow
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

/**
 * Generate Perlin-like noise for turbulence
 */
export function generateNoise(x: number, y: number, settings: NoiseSettings): number {
  let value = 0
  let amplitude = 1
  let frequency = settings.scale
  
  for (let i = 0; i < settings.octaves; i++) {
    const sampleX = x * frequency + settings.seed
    const sampleY = y * frequency + settings.seed
    
    // Simple pseudo-noise function (in a real implementation, you'd use proper Perlin noise)
    const noiseValue = Math.sin(sampleX * 0.1) * Math.cos(sampleY * 0.1) * 
                      Math.sin(sampleX * 0.05 + sampleY * 0.05)
    
    value += noiseValue * amplitude
    amplitude *= settings.persistence
    frequency *= settings.lacunarity
  }
  
  return value
}

/**
 * Calculate turbulent flow field at a given point
 */
export function calculateTurbulenceAt(
  x: number,
  y: number,
  sources: TurbulenceSource[],
  noiseSettings: NoiseSettings,
  flowSettings: FlowSettings,
  time: number
): FieldVector {
  let fieldX = 0
  let fieldY = 0
  
  // Add base flow if enabled
  if (flowSettings.enabled) {
    const baseAngleRad = (flowSettings.baseAngle * Math.PI) / 180
    fieldX += Math.cos(baseAngleRad) * flowSettings.baseVelocity
    fieldY += Math.sin(baseAngleRad) * flowSettings.baseVelocity
  }
  
  // Add influence from turbulence sources
  sources.forEach(source => {
    const dx = x - source.x
    const dy = y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 1) {
      const influence = source.strength / (1 + distance * 0.01)
      
      switch (source.type) {
        case 'vortex':
          // Rotational flow around the source
          fieldX += (-dy / distance) * influence * 0.1
          fieldY += (dx / distance) * influence * 0.1
          break
          
        case 'source':
          // Outward flow from the source
          fieldX += (dx / distance) * influence * 0.05
          fieldY += (dy / distance) * influence * 0.05
          break
          
        case 'sink':
          // Inward flow toward the source
          fieldX -= (dx / distance) * influence * 0.05
          fieldY -= (dy / distance) * influence * 0.05
          break
          
        case 'uniform':
          // Uniform flow in specified direction
          const angleRad = (source.angle * Math.PI) / 180
          fieldX += Math.cos(angleRad) * influence * 0.02
          fieldY += Math.sin(angleRad) * influence * 0.02
          break
      }
    }
  })
  
  // Add noise-based turbulence
  const noiseX = generateNoise(x + time * 0.5, y, noiseSettings) * 0.5
  const noiseY = generateNoise(x, y + time * 0.5, noiseSettings) * 0.5
  
  // Add time-varying turbulence
  const turbulenceX = Math.sin(time * 0.3 + x * 0.01 + y * 0.008) * 0.3 +
                     Math.cos(time * 0.7 + x * 0.005 - y * 0.012) * 0.2
  const turbulenceY = Math.cos(time * 0.4 + y * 0.01 + x * 0.009) * 0.3 +
                     Math.sin(time * 0.6 - x * 0.007 + y * 0.011) * 0.2
  
  fieldX += noiseX + turbulenceX
  fieldY += noiseY + turbulenceY
  
  return {
    fieldX,
    fieldY,
    angle: Math.atan2(fieldY, fieldX)
  }
}

/**
 * Generate streamline points for flow visualization
 */
export function generateStreamline(
  startX: number,
  startY: number,
  sources: TurbulenceSource[],
  noiseSettings: NoiseSettings,
  flowSettings: FlowSettings,
  time: number,
  steps: number = 150,
  stepSize: number = 3
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  let currentX = startX
  let currentY = startY
  
  for (let i = 0; i < steps; i++) {
    points.push({ x: currentX, y: currentY })
    
    const field = calculateTurbulenceAt(currentX, currentY, sources, noiseSettings, flowSettings, time)
    
    // Normalize and scale the field vector
    const magnitude = Math.sqrt(field.fieldX * field.fieldX + field.fieldY * field.fieldY)
    if (magnitude > 0.01) {
      currentX += (field.fieldX / magnitude) * stepSize
      currentY += (field.fieldY / magnitude) * stepSize
    } else {
      break // Stop if field is too weak
    }
    
    // Bounds checking (assuming canvas size)
    if (currentX < 0 || currentX > 1200 || currentY < 0 || currentY > 800) {
      break
    }
  }
  
  return points
}

/**
 * Generate a unique ID for turbulence sources
 */
export function generateSourceId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Generate source name based on type and count
 */
export function generateSourceName(type: TurbulenceSource['type'], count: number): string {
  const typeNames = {
    vortex: 'Vortex',
    source: 'Source',
    sink: 'Sink',
    uniform: 'Flow'
  }
  return `${typeNames[type]} ${count + 1}`
}

/**
 * Generate a unique ID for flowing particles
 */
export function generateParticleId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Create a new flowing particle
 */
export function createFlowingParticle(
  x: number, 
  y: number, 
  maxLife: number = 200,
  maxTrailLength: number = 50
): FlowingParticle {
  return {
    id: generateParticleId(),
    x,
    y,
    vx: 0,
    vy: 0,
    life: maxLife,
    maxLife,
    age: 0,
    trail: [{ x, y }],
    maxTrailLength
  }
}

/**
 * Update a flowing particle based on the turbulence field
 */
export function updateFlowingParticle(
  particle: FlowingParticle,
  sources: TurbulenceSource[],
  noiseSettings: NoiseSettings,
  flowSettings: FlowSettings,
  time: number,
  speed: number = 1.0,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): FlowingParticle {
  // Calculate field at particle position
  const field = calculateTurbulenceAt(particle.x, particle.y, sources, noiseSettings, flowSettings, time)
  
  // Update velocity based on field
  const magnitude = Math.sqrt(field.fieldX * field.fieldX + field.fieldY * field.fieldY)
  if (magnitude > 0.01) {
    particle.vx += (field.fieldX / magnitude) * speed * 0.1
    particle.vy += (field.fieldY / magnitude) * speed * 0.1
  }
  
  // Apply damping
  particle.vx *= 0.98
  particle.vy *= 0.98
  
  // Update position
  particle.x += particle.vx
  particle.y += particle.vy
  
  // Update trail
  particle.trail.push({ x: particle.x, y: particle.y })
  if (particle.trail.length > particle.maxTrailLength) {
    particle.trail.shift()
  }
  
  // Update life and age
  particle.life -= 1
  particle.age += 1
  
  return particle
}

/**
 * Check if particle should be reset (out of bounds or dead)
 */
export function shouldResetParticle(
  particle: FlowingParticle,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): boolean {
  return (
    particle.life <= 0 ||
    particle.x < 0 || 
    particle.x > canvasWidth ||
    particle.y < 0 || 
    particle.y > canvasHeight ||
    particle.age > particle.maxLife * 2
  )
}

/**
 * Reset particle to a new random position
 */
export function resetFlowingParticle(
  particle: FlowingParticle,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): FlowingParticle {
  return {
    ...particle,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: 0,
    vy: 0,
    life: particle.maxLife,
    age: 0,
    trail: []
  }
} 