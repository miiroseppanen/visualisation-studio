import type { GridLine, Pole, GridSettings, ZoomSettings } from './types'
import { POLE_VISUAL_RADIUS } from './constants'

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context from canvas')
    }
    this.ctx = context
  }

  /**
   * Setup canvas with proper DPR handling
   */
  setupCanvas(): void {
    const container = this.canvas.parentElement
    if (!container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    
    // Set the canvas size in CSS pixels
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
    
    // Set the canvas size in device pixels
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    
    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(dpr, dpr)
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw grid lines using Bezier curves
   */
  drawGridLines(gridLines: GridLine[]): void {
    this.ctx.strokeStyle = '#000'
    this.ctx.lineWidth = 1
    this.ctx.lineCap = 'round'

    gridLines.forEach(line => {
      this.ctx.beginPath()
      this.ctx.moveTo(line.startX, line.startY)
      this.ctx.bezierCurveTo(
        line.controlX1, line.controlY1,
        line.controlX2, line.controlY2,
        line.endX, line.endY
      )
      this.ctx.stroke()
    })
  }

  /**
   * Draw poles with numbering
   */
  drawPoles(poles: Pole[], zoomLevel: number, showPoles: boolean): void {
    if (!showPoles) return

    poles.forEach((pole, index) => {
      this.ctx.beginPath()
      const radius = POLE_VISUAL_RADIUS * zoomLevel
      this.ctx.arc(pole.x, pole.y, radius, 0, 2 * Math.PI)
      this.ctx.fillStyle = pole.isPositive ? '#ef4444' : '#3b82f6'
      this.ctx.fill()
      
      // Draw pole number
      this.ctx.fillStyle = '#fff'
      this.ctx.font = `bold ${Math.max(10, 10 * zoomLevel)}px sans-serif`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText((index + 1).toString(), pole.x, pole.y)
    })
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * Convert mouse coordinates to canvas coordinates
   */
  getCanvasCoordinates(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }
}

/**
 * Generate SVG export string
 */
export function generateSVGExport(
  gridLines: GridLine[], 
  poles: Pole[], 
  showPoles: boolean,
  width: number = 800,
  height: number = 600
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .grid-line { stroke: #000; stroke-width: 1; stroke-linecap: round; fill: none; }
          .pole { fill: var(--pole-color); }
        </style>
      </defs>
      ${gridLines.map(line => 
        `<path class="grid-line" d="M ${line.startX} ${line.startY} C ${line.controlX1} ${line.controlY1}, ${line.controlX2} ${line.controlY2}, ${line.endX} ${line.endY}" />`
      ).join('')}
      ${showPoles ? poles.map(pole => `
        <circle class="pole" style="fill: ${pole.isPositive ? '#ef4444' : '#3b82f6'}" cx="${pole.x}" cy="${pole.y}" r="8" />
      `).join('') : ''}
    </svg>
  `
  return svg
}

/**
 * Download SVG as file
 */
export function downloadSVG(svgContent: string, filename: string = 'grid-field.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
} 