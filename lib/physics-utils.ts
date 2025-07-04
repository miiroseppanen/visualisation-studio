import type { Pole } from './types'

// Common mathematical utilities
export const MathUtils = {
  // Distance calculations
  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  },

  // Angle calculations
  angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1)
  },

  // Normalize angle to [0, 2π]
  normalizeAngle(angle: number): number {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  },

  // Vector operations
  vectorLength(x: number, y: number): number {
    return Math.sqrt(x * x + y * y)
  },

  normalizeVector(x: number, y: number): { x: number; y: number } {
    const length = this.vectorLength(x, y)
    return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 }
  },

  // Interpolation
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  },

  // Clamping
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  },

  // Smooth step function
  smoothStep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)
  }
}

// Common field calculations
export const FieldUtils = {
  // Calculate field strength at a point from a pole
  calculatePoleField(
    x: number, 
    y: number, 
    pole: Pole, 
    falloffType: 'linear' | 'quadratic' | 'inverse' = 'quadratic'
  ): { fieldX: number; fieldY: number; strength: number } {
    const dx = x - pole.x
    const dy = y - pole.y
    const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy))
    
    let strength: number
    switch (falloffType) {
      case 'linear':
        strength = pole.strength / distance
        break
      case 'quadratic':
        strength = pole.strength / (distance * distance)
        break
      case 'inverse':
        strength = pole.strength / Math.max(1, distance)
        break
    }
    
    const angle = Math.atan2(dy, dx)
    const fieldX = Math.cos(angle) * strength * (pole.isPositive ? 1 : -1)
    const fieldY = Math.sin(angle) * strength * (pole.isPositive ? 1 : -1)
    
    return { fieldX, fieldY, strength }
  },

  // Calculate combined field from multiple poles
  calculateCombinedField(
    x: number,
    y: number,
    poles: Pole[],
    falloffType: 'linear' | 'quadratic' | 'inverse' = 'quadratic'
  ): { fieldX: number; fieldY: number; strength: number } {
    let totalFieldX = 0
    let totalFieldY = 0
    
    poles.forEach(pole => {
      const field = this.calculatePoleField(x, y, pole, falloffType)
      totalFieldX += field.fieldX
      totalFieldY += field.fieldY
    })
    
    const strength = MathUtils.vectorLength(totalFieldX, totalFieldY)
    return { fieldX: totalFieldX, fieldY: totalFieldY, strength }
  },

  // Add noise to field calculations
  addNoise(
    fieldX: number,
    fieldY: number,
    x: number,
    y: number,
    time: number,
    noiseStrength: number = 0.1,
    noiseScale: number = 0.01
  ): { fieldX: number; fieldY: number } {
    // Simple noise function (can be replaced with more sophisticated noise)
    const noise1 = Math.sin(x * noiseScale + time * 0.001) * Math.cos(y * noiseScale + time * 0.001)
    const noise2 = Math.cos(x * noiseScale * 1.7 + time * 0.0015) * Math.sin(y * noiseScale * 1.3 + time * 0.0012)
    
    return {
      fieldX: fieldX + noise1 * noiseStrength,
      fieldY: fieldY + noise2 * noiseStrength
    }
  }
}

// Common interaction utilities
export const InteractionUtils = {
  // Check if a point is within a circular area
  isPointInCircle(x: number, y: number, centerX: number, centerY: number, radius: number): boolean {
    return MathUtils.distance(x, y, centerX, centerY) <= radius
  },

  // Check if a pole is clicked
  isPoleClicked(x: number, y: number, pole: Pole, clickRadius: number = 20): boolean {
    return this.isPointInCircle(x, y, pole.x, pole.y, clickRadius)
  },

  // Find the closest pole to a point
  findClosestPole(x: number, y: number, poles: Pole[]): Pole | null {
    if (poles.length === 0) return null
    
    let closest = poles[0]
    let minDistance = MathUtils.distance(x, y, closest.x, closest.y)
    
    for (let i = 1; i < poles.length; i++) {
      const distance = MathUtils.distance(x, y, poles[i].x, poles[i].y)
      if (distance < minDistance) {
        minDistance = distance
        closest = poles[i]
      }
    }
    
    return closest
  },

  // Generate unique IDs
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Generate pole names
  generatePoleName(index: number, prefix: string = 'Pole'): string {
    return `${prefix} ${index + 1}`
  }
}

// Common animation utilities
export const AnimationUtils = {
  // Easing functions
  easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  easeIn(t: number): number {
    return t * t
  },

  easeOut(t: number): number {
    return 1 - (1 - t) * (1 - t)
  },

  // Oscillation functions
  oscillate(time: number, frequency: number = 1, amplitude: number = 1, phase: number = 0): number {
    return amplitude * Math.sin(time * frequency + phase)
  },

  // Pulse function
  pulse(time: number, frequency: number = 1, sharpness: number = 0.5): number {
    const t = (time * frequency) % 1
    return t < sharpness ? t / sharpness : (1 - t) / (1 - sharpness)
  },

  // Create animation loop controller
  createAnimationLoop(
    callback: (deltaTime: number) => void,
    targetFPS: number = 60
  ): { start: () => void; stop: () => void; isRunning: () => boolean } {
    let animationId: number | null = null
    let lastTime = 0
    const frameTime = 1000 / targetFPS
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameTime) {
        callback(currentTime - lastTime)
        lastTime = currentTime
      }
      animationId = requestAnimationFrame(animate)
    }
    
    return {
      start: () => {
        if (!animationId) {
          lastTime = performance.now()
          animationId = requestAnimationFrame(animate)
        }
      },
      stop: () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
      },
      isRunning: () => animationId !== null
    }
  }
}

// Common geometry utilities
export const GeometryUtils = {
  // Generate points on a circle
  generateCirclePoints(
    centerX: number,
    centerY: number,
    radius: number,
    pointCount: number,
    startAngle: number = 0
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = []
    const angleStep = (2 * Math.PI) / pointCount
    
    for (let i = 0; i < pointCount; i++) {
      const angle = startAngle + i * angleStep
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    }
    
    return points
  },

  // Generate grid points
  generateGridPoints(
    width: number,
    height: number,
    spacing: number,
    offset: { x: number; y: number } = { x: 0, y: 0 }
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = []
    
    for (let x = offset.x; x < width; x += spacing) {
      for (let y = offset.y; y < height; y += spacing) {
        points.push({ x, y })
      }
    }
    
    return points
  },

  // Calculate bounding box
  calculateBoundingBox(points: { x: number; y: number }[]): {
    minX: number; minY: number; maxX: number; maxY: number; width: number; height: number
  } {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    }
    
    let minX = points[0].x
    let minY = points[0].y
    let maxX = points[0].x
    let maxY = points[0].y
    
    for (let i = 1; i < points.length; i++) {
      minX = Math.min(minX, points[i].x)
      minY = Math.min(minY, points[i].y)
      maxX = Math.max(maxX, points[i].x)
      maxY = Math.max(maxY, points[i].y)
    }
    
    return {
      minX, minY, maxX, maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}

// Export all utilities as a single object for convenience
export const PhysicsUtils = {
  Math: MathUtils,
  Field: FieldUtils,
  Interaction: InteractionUtils,
  Animation: AnimationUtils,
  Geometry: GeometryUtils
} 