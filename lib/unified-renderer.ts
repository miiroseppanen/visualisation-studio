import type { Pole } from './types'

export interface RenderConfig {
  width: number
  height: number
  backgroundColor?: string
  devicePixelRatio?: number
}

export interface SVGExportConfig {
  width: number
  height: number
  backgroundColor?: string
  title?: string
}

export abstract class BaseRenderer {
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D
  protected width: number = 0
  protected height: number = 0
  protected dpr: number = 1

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

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect()
    
    // Use the container's actual size, but ensure we don't exceed viewport
    let width = rect.width
    let height = rect.height
    
    // On mobile, ensure we don't exceed viewport dimensions
    if (window.innerWidth < 768) { // Mobile breakpoint
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Use the smaller of container size or viewport size
      width = Math.min(width, viewportWidth)
      height = Math.min(height, viewportHeight)
      
      // Ensure minimum size
      width = Math.max(width, 300)
      height = Math.max(height, 400)
    }
    
    this.width = width
    this.height = height
    
    // Set actual canvas size in memory (scaled for retina)
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    
    // Scale canvas back down using CSS
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    
    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(this.dpr, this.dpr)
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.setupCanvas()
  }

  clear(backgroundColor = '#ffffff') {
    this.ctx.fillStyle = backgroundColor
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  getDimensions() {
    return { width: this.width, height: this.height }
  }

  getCanvasCoordinates(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  // Common drawing utilities
  drawLine(x1: number, y1: number, x2: number, y2: number, color = '#000000', width = 1) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.stroke()
  }

  drawCircle(x: number, y: number, radius: number, fillColor?: string, strokeColor?: string, strokeWidth = 1) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }
  }

  drawPath(points: { x: number; y: number }[], color = '#000000', width = 1, closed = false) {
    if (points.length < 2) return

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }
    
    if (closed) {
      this.ctx.closePath()
    }
    
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.stroke()
  }

  drawText(text: string, x: number, y: number, color = '#000000', fontSize = 12, fontFamily = 'sans-serif') {
    this.ctx.fillStyle = color
    this.ctx.font = `${fontSize}px ${fontFamily}`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, x, y)
  }

  // Common pole rendering
  drawPoles(poles: Pole[], scale = 1, showPoles = true) {
    if (!showPoles) return

    poles.forEach(pole => {
      const radius = Math.max(3, Math.min(15, pole.strength * 0.3)) * scale
      const color = pole.isPositive ? '#ef4444' : '#3b82f6'
      
      this.drawCircle(pole.x, pole.y, radius, color, '#ffffff', 2)
      
      // Draw pole symbol
      const symbol = pole.isPositive ? '+' : '−'
      this.drawText(symbol, pole.x, pole.y, '#ffffff', 10)
    })
  }

  // Abstract methods for specific visualizations
  abstract render(data: any, settings: any): void
  abstract exportSVG(data: any, settings: any, config: SVGExportConfig): string
}

// Utility functions for SVG generation
export class SVGBuilder {
  private svg: string = ''
  private width: number
  private height: number

  constructor(width: number, height: number, backgroundColor = '#ffffff') {
    this.width = width
    this.height = height
    this.svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`
    this.svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>\n`
  }

  addLine(x1: number, y1: number, x2: number, y2: number, color = '#000000', width = 1, opacity = 1) {
    this.svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>\n`
    return this
  }

  addCircle(x: number, y: number, radius: number, fillColor?: string, strokeColor?: string, strokeWidth = 1) {
    let attrs = `cx="${x}" cy="${y}" r="${radius}"`
    if (fillColor) attrs += ` fill="${fillColor}"`
    if (strokeColor) attrs += ` stroke="${strokeColor}" stroke-width="${strokeWidth}"`
    this.svg += `<circle ${attrs}/>\n`
    return this
  }

  addPath(points: { x: number; y: number }[], color = '#000000', width = 1, closed = false, opacity = 1) {
    if (points.length < 2) return this

    let path = `M${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`
    }
    if (closed) path += ' Z'

    this.svg += `<path d="${path}" stroke="${color}" stroke-width="${width}" fill="none" opacity="${opacity}"/>\n`
    return this
  }

  addCustomPath(pathData: string, color = '#000000', width = 1, opacity = 1) {
    this.svg += `<path d="${pathData}" stroke="${color}" stroke-width="${width}" fill="none" opacity="${opacity}"/>\n`
    return this
  }

  addText(text: string, x: number, y: number, color = '#000000', fontSize = 12, fontFamily = 'sans-serif') {
    this.svg += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" text-anchor="middle" dominant-baseline="middle">${text}</text>\n`
    return this
  }

  addPoles(poles: Pole[], scale = 1, showPoles = true) {
    if (!showPoles) return this

    poles.forEach(pole => {
      const radius = Math.max(3, Math.min(15, pole.strength * 0.3)) * scale
      const color = pole.isPositive ? '#ef4444' : '#3b82f6'
      
      this.addCircle(pole.x, pole.y, radius, color, '#ffffff', 2)
      
      // Add pole symbol
      const symbol = pole.isPositive ? '+' : '−'
      this.addText(symbol, pole.x, pole.y, '#ffffff', 10)
    })
    
    return this
  }

  build() {
    return this.svg + '</svg>'
  }
}

// Common export utilities
export function downloadSVG(svgContent: string, filename = 'visualization.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function generateSVGExport(
  renderFunction: (builder: SVGBuilder) => void,
  width: number,
  height: number,
  backgroundColor = '#ffffff'
): string {
  const builder = new SVGBuilder(width, height, backgroundColor)
  renderFunction(builder)
  return builder.build()
} 