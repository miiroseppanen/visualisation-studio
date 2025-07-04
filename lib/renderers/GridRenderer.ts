import { BaseRenderer, SVGBuilder, type SVGExportConfig } from '../unified-renderer'
import type { GridLine, Pole, GridSettings } from '../types'
import { POLE_VISUAL_RADIUS } from '../constants'

export class GridRenderer extends BaseRenderer {
  /**
   * Render the complete grid field visualization
   */
  render(data: { gridLines: GridLine[]; poles: Pole[]; zoomLevel?: number }, settings: GridSettings): void {
    this.clear()
    this.drawGridLines(data.gridLines)
    this.drawPoles(data.poles, data.zoomLevel || 1, settings.showPoles)
  }

  /**
   * Draw grid lines using Bezier curves
   */
  private drawGridLines(gridLines: GridLine[]): void {
    if (gridLines.length === 0) return

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
   * Export grid field as SVG
   */
  exportSVG(
    data: { gridLines: GridLine[]; poles: Pole[] }, 
    settings: GridSettings, 
    config: SVGExportConfig
  ): string {
    const builder = new SVGBuilder(config.width, config.height, config.backgroundColor)

    // Add grid lines
    data.gridLines.forEach(line => {
      // Create Bezier curve path
      const pathData = `M${line.startX},${line.startY} C${line.controlX1},${line.controlY1} ${line.controlX2},${line.controlY2} ${line.endX},${line.endY}`
      builder.addCustomPath(pathData, '#000', 1, 1)
    })

    // Add poles
    if (settings.showPoles) {
      builder.addPoles(data.poles, 1, true)
    }

    return builder.build()
  }

  /**
   * Override pole drawing to include numbering (grid-specific)
   */
  drawPoles(poles: Pole[], scale: number = 1, showPoles: boolean = true): void {
    if (!showPoles) return

    poles.forEach((pole, index) => {
      const radius = POLE_VISUAL_RADIUS * scale
      const color = pole.isPositive ? '#ef4444' : '#3b82f6'
      
      // Draw pole circle
      this.drawCircle(pole.x, pole.y, radius, color, '#ffffff', 2)
      
      // Draw pole number (grid-specific feature)
      this.ctx.fillStyle = '#fff'
      this.ctx.font = `bold ${Math.max(10, 10 * scale)}px sans-serif`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText((index + 1).toString(), pole.x, pole.y)
    })
  }
}

// Export utility functions for backward compatibility
export function generateSVGExport(
  gridLines: GridLine[], 
  poles: Pole[], 
  showPoles: boolean,
  width: number = 800,
  height: number = 600
): string {
  const renderer = new GridRenderer(document.createElement('canvas'))
  return renderer.exportSVG(
    { gridLines, poles }, 
    { showPoles } as GridSettings, 
    { width, height, backgroundColor: '#ffffff' }
  )
}

export function downloadSVG(svgContent: string, filename: string = 'grid-field.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
} 