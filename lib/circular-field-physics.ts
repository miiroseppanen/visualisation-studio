import type { Pole } from './types'

export interface CircularFieldLine {
  points: { x: number; y: number }[]
  radius: number
  centerX: number
  centerY: number
  poleId: string
  intensity: number
}

export interface CircularFieldSettings {
  lineCount: number
  lineSpacing: number
  lineWeight: number
  opacity: number
  showPoles: boolean
  animationSpeed: number
}

/**
 * Generate circular field lines around a single pole
 */
export function generateCircularFieldLinesAroundPole(
  pole: Pole,
  settings: CircularFieldSettings,
  canvasWidth: number,
  canvasHeight: number
): CircularFieldLine[] {
  const lines: CircularFieldLine[] = []
  const maxRadius = Math.max(canvasWidth, canvasHeight)
  
  // Generate concentric circles around the pole
  for (let i = 1; i <= settings.lineCount; i++) {
    const radius = i * settings.lineSpacing
    
    // Stop if the circle extends beyond reasonable bounds
    if (radius > maxRadius) break
    
    const fieldLine = generateCircularFieldLine(
      pole.x,
      pole.y,
      radius,
      pole.id,
      pole.strength
    )
    
    if (fieldLine) {
      lines.push(fieldLine)
    }
  }
  
  return lines
}

/**
 * Generate a single circular field line
 */
function generateCircularFieldLine(
  centerX: number,
  centerY: number,
  radius: number,
  poleId: string,
  strength: number
): CircularFieldLine {
  const points: { x: number; y: number }[] = []
  const numPoints = Math.max(32, Math.floor(radius * 0.5)) // More points for larger circles
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    points.push({ x, y })
  }
  
  return {
    points,
    radius,
    centerX,
    centerY,
    poleId,
    intensity: Math.abs(strength) / radius // Intensity decreases with distance
  }
}

/**
 * Generate all circular field lines for multiple poles
 */
export function generateAllCircularFieldLines(
  poles: Pole[],
  settings: CircularFieldSettings,
  canvasWidth: number,
  canvasHeight: number
): CircularFieldLine[] {
  const allLines: CircularFieldLine[] = []
  
  poles.forEach(pole => {
    const poleLines = generateCircularFieldLinesAroundPole(
      pole,
      settings,
      canvasWidth,
      canvasHeight
    )
    allLines.push(...poleLines)
  })
  
  return allLines
}

/**
 * Generate field lines with interaction between poles
 */
export function generateInteractiveCircularFieldLines(
  poles: Pole[],
  settings: CircularFieldSettings,
  canvasWidth: number,
  canvasHeight: number
): CircularFieldLine[] {
  if (poles.length === 0) return []
  
  const lines: CircularFieldLine[] = []
  
  poles.forEach(pole => {
    // Adjust line count based on pole strength - stronger poles get more field lines
    const strengthFactor = Math.max(0.5, Math.min(3, pole.strength / 5))
    const adjustedLineCount = Math.floor(settings.lineCount * strengthFactor)
    
    // Generate circles around each pole
    for (let i = 1; i <= adjustedLineCount; i++) {
      // Adjust spacing based on strength - stronger poles have tighter field lines
      const spacingFactor = Math.max(0.5, Math.min(2, 10 / pole.strength))
      const baseRadius = i * settings.lineSpacing * spacingFactor
      const points: { x: number; y: number }[] = []
      const numPoints = Math.max(64, Math.floor(baseRadius * 0.3))
      
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * 2 * Math.PI
        let x = pole.x + baseRadius * Math.cos(angle)
        let y = pole.y + baseRadius * Math.sin(angle)
        
        // Apply influence from other poles to deform the circles
        poles.forEach(otherPole => {
          if (otherPole.id !== pole.id) {
            const dx = x - otherPole.x
            const dy = y - otherPole.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0) {
              // Calculate influence based on pole strength and distance
              const influence = (otherPole.strength * 10) / (distance * distance)
              const influenceX = (dx / distance) * influence
              const influenceY = (dy / distance) * influence
              
              // Same polarity repels, opposite attracts
              const polarity = pole.isPositive === otherPole.isPositive ? 1 : -1
              x += influenceX * polarity
              y += influenceY * polarity
            }
          }
        })
        
        points.push({ x, y })
      }
      
      // Only add lines that stay within reasonable bounds
      const avgDistance = points.reduce((sum, point) => {
        const dx = point.x - pole.x
        const dy = point.y - pole.y
        return sum + Math.sqrt(dx * dx + dy * dy)
      }, 0) / points.length
      
      if (avgDistance < Math.max(canvasWidth, canvasHeight)) {
        lines.push({
          points,
          radius: baseRadius,
          centerX: pole.x,
          centerY: pole.y,
          poleId: pole.id,
          intensity: Math.abs(pole.strength) / baseRadius
        })
      }
    }
  })
  
  return lines
}

/**
 * Apply animation effects to field lines
 */
export function animateCircularFieldLines(
  lines: CircularFieldLine[],
  time: number,
  animationSpeed: number
): CircularFieldLine[] {
  return lines.map(line => {
    const rotationAngle = time * animationSpeed * 0.001
    const animatedPoints = line.points.map(point => {
      const dx = point.x - line.centerX
      const dy = point.y - line.centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const currentAngle = Math.atan2(dy, dx)
      const newAngle = currentAngle + rotationAngle / (1 + distance * 0.01)
      
      return {
        x: line.centerX + distance * Math.cos(newAngle),
        y: line.centerY + distance * Math.sin(newAngle)
      }
    })
    
    return {
      ...line,
      points: animatedPoints
    }
  })
}

/**
 * Filter field lines to remove those outside canvas bounds
 */
export function filterVisibleFieldLines(
  lines: CircularFieldLine[],
  canvasWidth: number,
  canvasHeight: number,
  margin: number = 50
): CircularFieldLine[] {
  return lines.filter(line => {
    // Check if any part of the circle is visible
    const minX = line.centerX - line.radius
    const maxX = line.centerX + line.radius
    const minY = line.centerY - line.radius
    const maxY = line.centerY + line.radius
    
    return (
      maxX >= -margin &&
      minX <= canvasWidth + margin &&
      maxY >= -margin &&
      minY <= canvasHeight + margin
    )
  })
} 