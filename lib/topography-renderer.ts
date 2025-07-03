import type { TopographyDisplaySettings } from './types'
import type { ElevationPoint, TopographySettings, ContourLine } from './topography-physics'
import { generateAllContourLines, calculateElevationAt, calculateGradientAt } from './topography-physics'

export class TopographyRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number = 0
  private height: number = 0
  private dpr: number = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas')
    }
    this.ctx = ctx
    this.dpr = window.devicePixelRatio || 1
    this.setupCanvas()
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height

    // Set actual size in memory (scaled for DPR)
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr

    // Scale the drawing context to match DPR
    this.ctx.scale(this.dpr, this.dpr)

    // Set canvas style size (not scaled)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.setupCanvas()
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  renderTopography(
    elevationPoints: ElevationPoint[],
    topographySettings: TopographySettings,
    displaySettings: TopographyDisplaySettings
  ): void {
    this.clear()

    // Render contour lines
    if (displaySettings.showContourLines && elevationPoints.length > 0) {
      this.renderContourLines(elevationPoints, topographySettings, displaySettings)
    }

    // Render gradient field (slope arrows)
    if (displaySettings.showGradientField && elevationPoints.length > 0) {
      this.renderGradientField(elevationPoints, topographySettings)
    }

    // Render elevation points
    if (displaySettings.showElevationPoints) {
      this.renderElevationPoints(elevationPoints, displaySettings)
    }
  }

  private renderContourLines(
    elevationPoints: ElevationPoint[],
    topographySettings: TopographySettings,
    displaySettings: TopographyDisplaySettings
  ): void {
    const contourLines = generateAllContourLines(
      elevationPoints,
      topographySettings,
      this.width,
      this.height
    )

    contourLines.forEach((contour, index) => {
      if (contour.points.length < 2) return

      // Determine if this is a major contour line
      const contourNumber = Math.round((contour.elevation - topographySettings.minElevation) / topographySettings.contourInterval)
      const isMajorContour = displaySettings.majorContourInterval > 0 && contourNumber % displaySettings.majorContourInterval === 0

      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = isMajorContour ? displaySettings.majorContourWeight : displaySettings.lineWeight
      this.ctx.globalAlpha = displaySettings.majorContourInterval === 0 ? 1.0 : (isMajorContour ? 1.0 : 0.7)

      // Draw the contour line
      this.ctx.beginPath()
      this.ctx.moveTo(contour.points[0].x, contour.points[0].y)

      for (let i = 1; i < contour.points.length; i++) {
        this.ctx.lineTo(contour.points[i].x, contour.points[i].y)
      }

      if (contour.closed) {
        this.ctx.closePath()
      }

      this.ctx.stroke()

      // Add elevation labels for major contours
      if (isMajorContour && displaySettings.showElevationLabels && contour.points.length > 10) {
        this.renderContourLabel(contour, displaySettings)
      }
    })

    this.ctx.globalAlpha = 1
  }

  private renderContourLabel(contour: ContourLine, displaySettings: TopographyDisplaySettings): void {
    // Find a good position for the label (middle of the line)
    const midIndex = Math.floor(contour.points.length / 2)
    const labelPoint = contour.points[midIndex]

    // Calculate text angle based on line direction
    const prevPoint = contour.points[Math.max(0, midIndex - 2)]
    const nextPoint = contour.points[Math.min(contour.points.length - 1, midIndex + 2)]
    const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x)

    this.ctx.save()
    this.ctx.translate(labelPoint.x, labelPoint.y)
    this.ctx.rotate(angle)

    // Draw label background
    const text = `${Math.round(contour.elevation)}m`
    this.ctx.font = '10px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    const metrics = this.ctx.measureText(text)
    const padding = 2
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillRect(
      -metrics.width / 2 - padding,
      -6,
      metrics.width + padding * 2,
      12
    )

    // Draw label text
    this.ctx.fillStyle = '#000000'
    this.ctx.fillText(text, 0, 0)

    this.ctx.restore()
  }

  private renderGradientField(
    elevationPoints: ElevationPoint[],
    topographySettings: TopographySettings
  ): void {
    const spacing = 50 // Distance between gradient arrows
    this.ctx.strokeStyle = '#666666'
    this.ctx.lineWidth = 1
    this.ctx.globalAlpha = 0.6

    for (let x = spacing; x < this.width; x += spacing) {
      for (let y = spacing; y < this.height; y += spacing) {
        const gradient = calculateGradientAt(x, y, elevationPoints, topographySettings)
        
        const magnitude = Math.sqrt(gradient.fieldX * gradient.fieldX + gradient.fieldY * gradient.fieldY)
        if (magnitude > 0.01) {
          const arrowLength = Math.min(20, magnitude * 100)
          const endX = x + (gradient.fieldX / magnitude) * arrowLength
          const endY = y + (gradient.fieldY / magnitude) * arrowLength

          // Draw arrow
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
          this.ctx.lineTo(endX, endY)

          // Add arrowhead
          const headSize = 4
          const angle = Math.atan2(gradient.fieldY, gradient.fieldX)
          this.ctx.lineTo(
            endX - headSize * Math.cos(angle - Math.PI / 6),
            endY - headSize * Math.sin(angle - Math.PI / 6)
          )
          this.ctx.moveTo(endX, endY)
          this.ctx.lineTo(
            endX - headSize * Math.cos(angle + Math.PI / 6),
            endY - headSize * Math.sin(angle + Math.PI / 6)
          )

          this.ctx.stroke()
        }
      }
    }

    this.ctx.globalAlpha = 1
  }

  private renderElevationPoints(elevationPoints: ElevationPoint[], displaySettings: TopographyDisplaySettings): void {
    elevationPoints.forEach(point => {
      this.ctx.save()

      // Point colors based on type
      const colors = {
        peak: '#8B4513',
        valley: '#4169E1',
        saddle: '#9370DB',
        ridge: '#228B22'
      }

      const radius = 10

      // First, clear a larger area around the elevation point to ensure no contour lines show through
      this.ctx.globalCompositeOperation = 'destination-out'
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, radius + 3, 0, 2 * Math.PI)
      this.ctx.fill()

      // Reset composite operation for normal drawing
      this.ctx.globalCompositeOperation = 'source-over'

      // Draw elevation point with better contrast
      this.ctx.fillStyle = colors[point.type]
      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = 2

      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.stroke()

      // Draw inner white circle for better contrast
      this.ctx.fillStyle = '#ffffff'
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, radius - 3, 0, 2 * Math.PI)
      this.ctx.fill()

      // Draw clearer type indicator using simple geometric shapes
      this.ctx.fillStyle = colors[point.type]
      this.ctx.strokeStyle = colors[point.type]
      this.ctx.lineWidth = 2

      switch (point.type) {
        case 'peak':
          // Draw upward triangle
          this.ctx.beginPath()
          this.ctx.moveTo(point.x, point.y - 4)
          this.ctx.lineTo(point.x - 3, point.y + 2)
          this.ctx.lineTo(point.x + 3, point.y + 2)
          this.ctx.closePath()
          this.ctx.fill()
          break
        
        case 'valley':
          // Draw downward triangle
          this.ctx.beginPath()
          this.ctx.moveTo(point.x, point.y + 4)
          this.ctx.lineTo(point.x - 3, point.y - 2)
          this.ctx.lineTo(point.x + 3, point.y - 2)
          this.ctx.closePath()
          this.ctx.fill()
          break
        
        case 'saddle':
          // Draw X shape
          this.ctx.beginPath()
          this.ctx.moveTo(point.x - 3, point.y - 3)
          this.ctx.lineTo(point.x + 3, point.y + 3)
          this.ctx.moveTo(point.x + 3, point.y - 3)
          this.ctx.lineTo(point.x - 3, point.y + 3)
          this.ctx.stroke()
          break
        
        case 'ridge':
          // Draw horizontal line
          this.ctx.beginPath()
          this.ctx.moveTo(point.x - 4, point.y)
          this.ctx.lineTo(point.x + 4, point.y)
          this.ctx.stroke()
          break
      }

      // Draw name and elevation label
      if (displaySettings.showElevationLabels) {
        this.ctx.fillStyle = '#000000'
        this.ctx.font = 'bold 11px sans-serif'
        this.ctx.textAlign = 'center'
        
        // Name
        this.ctx.fillText(point.name, point.x, point.y - radius - 10)
        
        // Elevation
        this.ctx.fillText(`${Math.round(point.elevation)}m`, point.x, point.y + radius + 18)
      }

      this.ctx.restore()
    })
  }

  exportAsSVG(
    elevationPoints: ElevationPoint[],
    topographySettings: TopographySettings,
    displaySettings: TopographyDisplaySettings
  ): string {
    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">\n`
    svg += `<rect width="${this.width}" height="${this.height}" fill="white"/>\n`

    // Generate contour lines for SVG
    if (displaySettings.showContourLines && elevationPoints.length > 0) {
      const contourLines = generateAllContourLines(
        elevationPoints,
        topographySettings,
        this.width,
        this.height
      )

      contourLines.forEach(contour => {
        if (contour.points.length < 2) return

        const contourNumber = Math.round((contour.elevation - topographySettings.minElevation) / topographySettings.contourInterval)
        const isMajorContour = displaySettings.majorContourInterval > 0 && contourNumber % displaySettings.majorContourInterval === 0
        const strokeWidth = isMajorContour ? displaySettings.majorContourWeight : displaySettings.lineWeight
        const opacity = displaySettings.majorContourInterval === 0 ? 1.0 : (isMajorContour ? 1.0 : 0.7)

        let path = `M${contour.points[0].x},${contour.points[0].y}`
        for (let i = 1; i < contour.points.length; i++) {
          path += ` L${contour.points[i].x},${contour.points[i].y}`
        }
        if (contour.closed) {
          path += ' Z'
        }

        svg += `<path d="${path}" stroke="black" fill="none" stroke-width="${strokeWidth}" opacity="${opacity}"/>\n`

        // Add elevation labels for major contours
        if (isMajorContour && displaySettings.showElevationLabels && contour.points.length > 10) {
          const midIndex = Math.floor(contour.points.length / 2)
          const labelPoint = contour.points[midIndex]
          svg += `<text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" fill="black" font-size="10" font-family="sans-serif">${Math.round(contour.elevation)}m</text>\n`
        }
      })
    }

    // Add elevation points to SVG
    if (displaySettings.showElevationPoints) {
      elevationPoints.forEach(point => {
        const colors = {
          peak: '#8B4513',
          valley: '#4169E1',
          saddle: '#9370DB',
          ridge: '#228B22'
        }

        // Outer circle
        svg += `<circle cx="${point.x}" cy="${point.y}" r="10" fill="${colors[point.type]}" stroke="black" stroke-width="2"/>\n`
        
        // Inner white circle
        svg += `<circle cx="${point.x}" cy="${point.y}" r="7" fill="white"/>\n`

        // Type indicators using geometric shapes
        switch (point.type) {
          case 'peak':
            svg += `<polygon points="${point.x},${point.y - 4} ${point.x - 3},${point.y + 2} ${point.x + 3},${point.y + 2}" fill="${colors[point.type]}"/>\n`
            break
          case 'valley':
            svg += `<polygon points="${point.x},${point.y + 4} ${point.x - 3},${point.y - 2} ${point.x + 3},${point.y - 2}" fill="${colors[point.type]}"/>\n`
            break
          case 'saddle':
            svg += `<line x1="${point.x - 3}" y1="${point.y - 3}" x2="${point.x + 3}" y2="${point.y + 3}" stroke="${colors[point.type]}" stroke-width="2"/>\n`
            svg += `<line x1="${point.x + 3}" y1="${point.y - 3}" x2="${point.x - 3}" y2="${point.y + 3}" stroke="${colors[point.type]}" stroke-width="2"/>\n`
            break
          case 'ridge':
            svg += `<line x1="${point.x - 4}" y1="${point.y}" x2="${point.x + 4}" y2="${point.y}" stroke="${colors[point.type]}" stroke-width="2"/>\n`
            break
        }

        if (displaySettings.showElevationLabels) {
          svg += `<text x="${point.x}" y="${point.y - 20}" text-anchor="middle" fill="black" font-size="11" font-family="sans-serif" font-weight="bold">${point.name}</text>\n`
          svg += `<text x="${point.x}" y="${point.y + 28}" text-anchor="middle" fill="black" font-size="11" font-family="sans-serif" font-weight="bold">${Math.round(point.elevation)}m</text>\n`
        }
      })
    }

    svg += '</svg>'
    return svg
  }
} 