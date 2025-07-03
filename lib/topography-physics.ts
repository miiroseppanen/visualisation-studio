import type { FieldVector } from './types'

export interface ElevationPoint {
  id: string
  name: string
  x: number
  y: number
  elevation: number
  type: 'peak' | 'valley' | 'saddle' | 'ridge'
  radius: number
}

export interface ContourLine {
  elevation: number
  points: { x: number; y: number }[]
  closed: boolean
}

export interface TopographySettings {
  contourInterval: number
  minElevation: number
  maxElevation: number
  smoothing: number
  resolution: number
}

/**
 * Calculate elevation at any point based on elevation points
 */
export function calculateElevationAt(
  x: number,
  y: number,
  elevationPoints: ElevationPoint[],
  settings: TopographySettings
): number {
  if (elevationPoints.length === 0) {
    return 0
  }

  let totalWeight = 0
  let weightedElevation = 0

  // Use inverse distance weighting with type-specific influence
  elevationPoints.forEach(point => {
    const dx = x - point.x
    const dy = y - point.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Avoid division by zero
    if (distance < 1) {
      return point.elevation
    }

    // Calculate influence based on distance and point type
    let influence = 1 / Math.pow(distance, 2)
    
    // Adjust influence based on radius and type
    const radiusEffect = Math.exp(-distance / point.radius)
    
    switch (point.type) {
      case 'peak':
        influence *= (1 + radiusEffect * 2)
        break
      case 'valley':
        influence *= (1 + radiusEffect * 1.5)
        break
      case 'ridge':
        // Ridge influence is directional - stronger along the ridge line
        const ridgeAngle = Math.atan2(dy, dx)
        const ridgeFactor = Math.abs(Math.cos(ridgeAngle * 2)) // Creates ridge-like pattern
        influence *= (1 + radiusEffect * ridgeFactor)
        break
      case 'saddle':
        // Saddle creates a pass between peaks
        influence *= (1 + radiusEffect * 0.8)
        break
    }

    const weight = influence
    totalWeight += weight
    weightedElevation += point.elevation * weight
  })

  if (totalWeight === 0) {
    return 0
  }

  const baseElevation = weightedElevation / totalWeight

  // Add some noise for more realistic terrain
  const noiseScale = 0.01
  const noise = Math.sin(x * noiseScale) * Math.cos(y * noiseScale) * 
                Math.sin(x * noiseScale * 1.7 + y * noiseScale * 1.3) * 10

  return Math.max(settings.minElevation, 
         Math.min(settings.maxElevation, baseElevation + noise))
}

/**
 * Check if a point is too close to any elevation point and should be excluded from contours
 */
function isPointNearElevationPoint(
  x: number,
  y: number,
  elevationPoints: ElevationPoint[]
): boolean {
  for (const point of elevationPoints) {
    const dx = x - point.x
    const dy = y - point.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Exclude points within the visual radius of elevation points (much larger than render radius for clean separation)
    const exclusionRadius = 20 // Much larger than the 10px render radius to ensure clean circles
    if (distance < exclusionRadius) {
      return true
    }
  }
  return false
}

/**
 * Check if a line segment intersects with any elevation point circle
 */
function lineIntersectsElevationPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  elevationPoints: ElevationPoint[]
): boolean {
  const exclusionRadius = 20
  
  for (const point of elevationPoints) {
    // Calculate distance from point to line segment
    const A = x2 - x1
    const B = y2 - y1
    const C = x1 - point.x
    const D = y1 - point.y
    
    const dot = -(C * A + D * B)
    const lenSq = A * A + B * B
    
    if (lenSq === 0) {
      // Line segment is a point
      const dist = Math.sqrt(C * C + D * D)
      return dist < exclusionRadius
    }
    
    const param = dot / lenSq
    
    let closestX, closestY
    if (param < 0) {
      closestX = x1
      closestY = y1
    } else if (param > 1) {
      closestX = x2
      closestY = y2
    } else {
      closestX = x1 + param * A
      closestY = y1 + param * B
    }
    
    const dx = point.x - closestX
    const dy = point.y - closestY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < exclusionRadius) {
      return true
    }
  }
  
  return false
}

/**
 * Split contour lines that intersect with elevation points
 */
function clipContourLines(
  contourPoints: { x: number; y: number }[],
  elevationPoints: ElevationPoint[]
): { x: number; y: number }[][] {
  if (contourPoints.length < 2) {
    return [contourPoints]
  }
  
  const segments: { x: number; y: number }[][] = []
  let currentSegment: { x: number; y: number }[] = [contourPoints[0]]
  
  for (let i = 1; i < contourPoints.length; i++) {
    const prevPoint = contourPoints[i - 1]
    const currPoint = contourPoints[i]
    
    // Check if this line segment intersects any elevation point
    if (lineIntersectsElevationPoint(prevPoint.x, prevPoint.y, currPoint.x, currPoint.y, elevationPoints)) {
      // End current segment if it has enough points
      if (currentSegment.length > 1) {
        segments.push(currentSegment)
      }
      // Start new segment from current point
      currentSegment = [currPoint]
    } else {
      // Continue current segment
      currentSegment.push(currPoint)
    }
  }
  
  // Add final segment if it has enough points
  if (currentSegment.length > 1) {
    segments.push(currentSegment)
  }
  
  return segments
}

/**
 * Build contour lines segment by segment, checking each bit for intersections
 */
function buildContourLineSegments(
  elevation: number,
  elevationPoints: ElevationPoint[],
  settings: TopographySettings,
  width: number,
  height: number
): ContourLine[] {
  const contours: ContourLine[] = []
  const resolution = settings.resolution
  const step = Math.max(2, Math.floor(20 / resolution))
  const exclusionRadius = 20

  // Create elevation grid
  const cols = Math.floor(width / step)
  const rows = Math.floor(height / step)
  const elevationGrid: number[][] = []

  for (let row = 0; row < rows; row++) {
    elevationGrid[row] = []
    for (let col = 0; col < cols; col++) {
      const x = col * step
      const y = row * step
      elevationGrid[row][col] = calculateElevationAt(x, y, elevationPoints, settings)
    }
  }

  // Process each grid cell and build contour segments incrementally
  const activeContours: { x: number; y: number }[][] = []

  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const x = col * step
      const y = row * step

      // Skip cells that are too close to elevation points
      if (isPointNearElevationPoint(x + step/2, y + step/2, elevationPoints)) {
        continue
      }

      // Get the four corner elevations
      const tl = elevationGrid[row][col]
      const tr = elevationGrid[row][col + 1]
      const bl = elevationGrid[row + 1][col]
      const br = elevationGrid[row + 1][col + 1]

      // Find edge intersections for this cell
      const cellSegments: { start: { x: number; y: number }, end: { x: number; y: number } }[] = []

      // Top edge
      if ((tl <= elevation && tr > elevation) || (tl > elevation && tr <= elevation)) {
        const t = (elevation - tl) / (tr - tl)
        const edgePoint = { x: x + t * step, y }
        if (!isPointNearElevationPoint(edgePoint.x, edgePoint.y, elevationPoints)) {
          // Check for right edge intersection to create a segment
          if ((tr <= elevation && br > elevation) || (tr > elevation && br <= elevation)) {
            const tRight = (elevation - tr) / (br - tr)
            const rightPoint = { x: x + step, y: y + tRight * step }
            if (!isPointNearElevationPoint(rightPoint.x, rightPoint.y, elevationPoints)) {
              // Check if the line segment between these points intersects any elevation point
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, rightPoint.x, rightPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: rightPoint })
              }
            }
          }
          // Check for bottom edge intersection
          if ((bl <= elevation && br > elevation) || (bl > elevation && br <= elevation)) {
            const tBottom = (elevation - bl) / (br - bl)
            const bottomPoint = { x: x + tBottom * step, y: y + step }
            if (!isPointNearElevationPoint(bottomPoint.x, bottomPoint.y, elevationPoints)) {
              // Check if the line segment between these points intersects any elevation point
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, bottomPoint.x, bottomPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: bottomPoint })
              }
            }
          }
          // Check for left edge intersection
          if ((tl <= elevation && bl > elevation) || (tl > elevation && bl <= elevation)) {
            const tLeft = (elevation - tl) / (bl - tl)
            const leftPoint = { x, y: y + tLeft * step }
            if (!isPointNearElevationPoint(leftPoint.x, leftPoint.y, elevationPoints)) {
              // Check if the line segment between these points intersects any elevation point
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, leftPoint.x, leftPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: leftPoint })
              }
            }
          }
        }
      }

      // Right edge intersections with bottom and left (avoiding duplicates)
      if ((tr <= elevation && br > elevation) || (tr > elevation && br <= elevation)) {
        const t = (elevation - tr) / (br - tr)
        const edgePoint = { x: x + step, y: y + t * step }
        if (!isPointNearElevationPoint(edgePoint.x, edgePoint.y, elevationPoints)) {
          // Check for bottom edge intersection
          if ((bl <= elevation && br > elevation) || (bl > elevation && br <= elevation)) {
            const tBottom = (elevation - bl) / (br - bl)
            const bottomPoint = { x: x + tBottom * step, y: y + step }
            if (!isPointNearElevationPoint(bottomPoint.x, bottomPoint.y, elevationPoints)) {
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, bottomPoint.x, bottomPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: bottomPoint })
              }
            }
          }
          // Check for left edge intersection
          if ((tl <= elevation && bl > elevation) || (tl > elevation && bl <= elevation)) {
            const tLeft = (elevation - tl) / (bl - tl)
            const leftPoint = { x, y: y + tLeft * step }
            if (!isPointNearElevationPoint(leftPoint.x, leftPoint.y, elevationPoints)) {
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, leftPoint.x, leftPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: leftPoint })
              }
            }
          }
        }
      }

      // Bottom edge with left edge
      if ((bl <= elevation && br > elevation) || (bl > elevation && br <= elevation)) {
        const t = (elevation - bl) / (br - bl)
        const edgePoint = { x: x + t * step, y: y + step }
        if (!isPointNearElevationPoint(edgePoint.x, edgePoint.y, elevationPoints)) {
          // Check for left edge intersection
          if ((tl <= elevation && bl > elevation) || (tl > elevation && bl <= elevation)) {
            const tLeft = (elevation - tl) / (bl - tl)
            const leftPoint = { x, y: y + tLeft * step }
            if (!isPointNearElevationPoint(leftPoint.x, leftPoint.y, elevationPoints)) {
              if (!lineIntersectsElevationPoint(edgePoint.x, edgePoint.y, leftPoint.x, leftPoint.y, elevationPoints)) {
                cellSegments.push({ start: edgePoint, end: leftPoint })
              }
            }
          }
        }
      }

      // Add valid segments to contours
      cellSegments.forEach(segment => {
        contours.push({
          elevation,
          points: [segment.start, segment.end],
          closed: false
        })
      })
    }
  }

  return contours
}

/**
 * Generate contour lines for a given elevation
 */
export function generateContourLine(
  elevation: number,
  elevationPoints: ElevationPoint[],
  settings: TopographySettings,
  width: number,
  height: number
): ContourLine[] {
  return buildContourLineSegments(elevation, elevationPoints, settings, width, height)
}

/**
 * Smooth contour line points
 */
function smoothContourLine(points: { x: number; y: number }[], smoothing: number): { x: number; y: number }[] {
  if (points.length < 3 || smoothing <= 0) {
    return points
  }

  const smoothed: { x: number; y: number }[] = []
  const factor = Math.min(1, smoothing)

  for (let i = 0; i < points.length; i++) {
    const prev = points[i === 0 ? points.length - 1 : i - 1]
    const curr = points[i]
    const next = points[i === points.length - 1 ? 0 : i + 1]

    const smoothX = curr.x + factor * ((prev.x + next.x) / 2 - curr.x) * 0.1
    const smoothY = curr.y + factor * ((prev.y + next.y) / 2 - curr.y) * 0.1

    smoothed.push({ x: smoothX, y: smoothY })
  }

  return smoothed
}

/**
 * Generate all contour lines for the current elevation points
 */
export function generateAllContourLines(
  elevationPoints: ElevationPoint[],
  settings: TopographySettings,
  width: number,
  height: number
): ContourLine[] {
  const contours: ContourLine[] = []
  
  const elevationRange = settings.maxElevation - settings.minElevation
  const numContours = Math.floor(elevationRange / settings.contourInterval)

  for (let i = 0; i <= numContours; i++) {
    const elevation = settings.minElevation + i * settings.contourInterval
    const contourLines = generateContourLine(elevation, elevationPoints, settings, width, height)
    contours.push(...contourLines)
  }

  return contours
}

/**
 * Generate a unique ID for elevation points
 */
export function generateElevationId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Generate elevation point name based on type and count
 */
export function generateElevationName(type: ElevationPoint['type'], count: number): string {
  const typeNames = {
    peak: 'Peak',
    valley: 'Valley',
    saddle: 'Saddle',
    ridge: 'Ridge'
  }
  return `${typeNames[type]} ${count + 1}`
}

/**
 * Calculate gradient at a point (for slope visualization)
 */
export function calculateGradientAt(
  x: number,
  y: number,
  elevationPoints: ElevationPoint[],
  settings: TopographySettings
): FieldVector {
  const dx = 2
  const dy = 2
  
  const elevationE = calculateElevationAt(x + dx, y, elevationPoints, settings)
  const elevationW = calculateElevationAt(x - dx, y, elevationPoints, settings)
  const elevationN = calculateElevationAt(x, y - dy, elevationPoints, settings)
  const elevationS = calculateElevationAt(x, y + dy, elevationPoints, settings)
  
  const gradientX = (elevationE - elevationW) / (2 * dx)
  const gradientY = (elevationS - elevationN) / (2 * dy)
  
  return {
    fieldX: gradientX,
    fieldY: gradientY,
    angle: Math.atan2(gradientY, gradientX)
  }
} 