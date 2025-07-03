import type { Pole } from './types'
import type { CircularFieldLine } from './circular-field-physics'
import type { CircularFieldDisplaySettings } from './types'

export class CircularFieldRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number = 0
  private height: number = 0
  private dpr: number = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context from canvas')
    }
    this.ctx = context
    this.setupCanvas()
  }

  private setupCanvas(): void {
    this.dpr = window.devicePixelRatio || 1
    this.ctx.scale(this.dpr, this.dpr)
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.setupCanvas()
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  renderCircularField(
    poles: Pole[],
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings
  ): void {
    this.clear()

    // Render field lines first (so poles appear on top)
    if (displaySettings.showFieldLines) {
      this.renderFieldLines(fieldLines, displaySettings)
    }

    // Render poles
    if (displaySettings.showPoles) {
      this.renderPoles(poles, displaySettings)
    }
  }

  private renderFieldLines(
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings
  ): void {
    fieldLines.forEach(line => {
      if (line.points.length < 2) return

      this.ctx.save()
      
      // Set line style
      this.ctx.strokeStyle = '#000000' // Black lines as requested
      this.ctx.lineWidth = displaySettings.lineWeight
      this.ctx.globalAlpha = displaySettings.opacity
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'

      // Draw the circular field line
      this.ctx.beginPath()
      this.ctx.moveTo(line.points[0].x, line.points[0].y)

      // Use smooth curves for better visual quality
      for (let i = 1; i < line.points.length; i++) {
        const point = line.points[i]
        const prevPoint = line.points[i - 1]
        
        // Create smooth curves between points
        const midX = (prevPoint.x + point.x) / 2
        const midY = (prevPoint.y + point.y) / 2
        
        this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
      }

      // Close the circle smoothly
      if (line.points.length > 2) {
        const firstPoint = line.points[0]
        const lastPoint = line.points[line.points.length - 1]
        const midX = (lastPoint.x + firstPoint.x) / 2
        const midY = (lastPoint.y + firstPoint.y) / 2
        this.ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY)
        this.ctx.closePath()
      }

      this.ctx.stroke()
      this.ctx.restore()
    })
  }

  private renderPoles(
    poles: Pole[],
    displaySettings: CircularFieldDisplaySettings
  ): void {
    poles.forEach((pole, index) => {
      this.ctx.save()

      // Draw pole circle
      const radius = 12
      this.ctx.beginPath()
      this.ctx.arc(pole.x, pole.y, radius, 0, 2 * Math.PI)
      
      // Color based on polarity
      this.ctx.fillStyle = pole.isPositive ? '#ef4444' : '#3b82f6'
      this.ctx.fill()
      
      // Add border
      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      // Add polarity symbol
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = 'bold 14px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(pole.isPositive ? '+' : '−', pole.x, pole.y)

      // Add pole label if enabled
      if (displaySettings.showPoleLabels) {
        this.ctx.fillStyle = '#000000'
        this.ctx.font = '12px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          pole.name || `Pole ${index + 1}`,
          pole.x,
          pole.y - radius - 8
        )
        
        // Show strength
        this.ctx.font = '10px sans-serif'
        this.ctx.fillStyle = '#666666'
        this.ctx.fillText(
          `${pole.strength.toFixed(1)}`,
          pole.x,
          pole.y + radius + 16
        )
      }

      this.ctx.restore()
    })
  }

  exportAsSVG(
    poles: Pole[],
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings
  ): string {
    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">\n`
    svg += `<rect width="${this.width}" height="${this.height}" fill="white"/>\n`

    // Add field lines to SVG
    if (displaySettings.showFieldLines) {
      fieldLines.forEach(line => {
        if (line.points.length < 2) return

        let path = `M${line.points[0].x},${line.points[0].y}`
        
        // Create smooth path
        for (let i = 1; i < line.points.length; i++) {
          const point = line.points[i]
          const prevPoint = line.points[i - 1]
          const midX = (prevPoint.x + point.x) / 2
          const midY = (prevPoint.y + point.y) / 2
          path += ` Q${prevPoint.x},${prevPoint.y} ${midX},${midY}`
        }
        
        // Close the path
        if (line.points.length > 2) {
          const firstPoint = line.points[0]
          const lastPoint = line.points[line.points.length - 1]
          const midX = (lastPoint.x + firstPoint.x) / 2
          const midY = (lastPoint.y + firstPoint.y) / 2
          path += ` Q${lastPoint.x},${lastPoint.y} ${midX},${midY}`
          path += ' Z'
        }

        svg += `<path d="${path}" stroke="black" fill="none" stroke-width="${displaySettings.lineWeight}" opacity="${displaySettings.opacity}" stroke-linecap="round" stroke-linejoin="round"/>\n`
      })
    }

    // Add poles to SVG
    if (displaySettings.showPoles) {
      poles.forEach((pole, index) => {
        const radius = 12
        const color = pole.isPositive ? '#ef4444' : '#3b82f6'
        
        svg += `<circle cx="${pole.x}" cy="${pole.y}" r="${radius}" fill="${color}" stroke="black" stroke-width="2"/>\n`
        svg += `<text x="${pole.x}" y="${pole.y + 4}" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">${pole.isPositive ? '+' : '−'}</text>\n`
        
        if (displaySettings.showPoleLabels) {
          svg += `<text x="${pole.x}" y="${pole.y - radius - 8}" text-anchor="middle" fill="black" font-size="12" font-family="sans-serif">${pole.name || `Pole ${index + 1}`}</text>\n`
          svg += `<text x="${pole.x}" y="${pole.y + radius + 16}" text-anchor="middle" fill="#666666" font-size="10" font-family="sans-serif">${pole.strength.toFixed(1)}</text>\n`
        }
      })
    }

    svg += '</svg>'
    return svg
  }

  /**
   * Get canvas coordinates from mouse event
   */
  getCanvasCoordinates(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  /**
   * Check if a point is near a pole
   */
  findPoleAt(x: number, y: number, poles: Pole[], tolerance: number = 15): Pole | null {
    for (const pole of poles) {
      const dx = x - pole.x
      const dy = y - pole.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= tolerance) {
        return pole
      }
    }
    return null
  }
} 