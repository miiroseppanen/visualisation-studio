import { BaseRenderer, SVGBuilder, type SVGExportConfig } from '../unified-renderer'
import type { Pole } from '../types'
import type { CircularFieldLine } from '../circular-field-physics'
import type { CircularFieldDisplaySettings } from '../types'

interface CircularFieldRenderData {
  poles: Pole[]
  fieldLines: CircularFieldLine[]
}

export class CircularFieldRenderer extends BaseRenderer {
  // Implementation of abstract methods
  render(data: CircularFieldRenderData, settings: CircularFieldDisplaySettings): void {
    this.renderCircularField(data.poles, data.fieldLines, settings)
  }

  exportSVG(data: CircularFieldRenderData, settings: CircularFieldDisplaySettings, config: SVGExportConfig): string {
    return this.exportCircularFieldSVG(data.poles, data.fieldLines, settings)
  }

  renderCircularField(
    poles: Pole[],
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings,
    theme: 'light' | 'dark' | 'system' = 'light'
  ): void {
    this.clear()

    // Determine if dark theme is active
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Render field lines first (so poles appear on top)
    if (displaySettings.showFieldLines) {
      this.renderFieldLines(fieldLines, displaySettings, isDark)
    }

    // Render poles using unified utilities
    if (displaySettings.showPoles) {
      this.renderPoles(poles, displaySettings, isDark)
    }
  }

  private renderFieldLines(
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings,
    isDark: boolean
  ): void {
    fieldLines.forEach(line => {
      if (line.points.length < 2) return

      this.ctx.save()
      
      // Calculate line appearance based on intensity (pole strength)
      const baseLineWidth = displaySettings.lineWeight
      const baseOpacity = displaySettings.opacity
      
      // Intensity affects both line width and opacity
      const intensityFactor = Math.min(3, Math.max(0.1, line.intensity * 2))
      const lineWidth = baseLineWidth * intensityFactor
      const opacity = baseOpacity * intensityFactor
      
      // Set line style with theme-aware colors
      this.ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
      this.ctx.lineWidth = lineWidth
      this.ctx.globalAlpha = opacity
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'

      // Draw the circular field line using smooth curves
      this.ctx.beginPath()
      this.ctx.moveTo(line.points[0].x, line.points[0].y)

      for (let i = 1; i < line.points.length; i++) {
        const point = line.points[i]
        const prevPoint = line.points[i - 1]
        
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
    displaySettings: CircularFieldDisplaySettings,
    isDark: boolean
  ): void {
    poles.forEach((pole, index) => {
      // Use unified pole rendering
      this.drawPoles([pole])

      // Add pole label if enabled (specific to circular field)
      if (displaySettings.showPoleLabels) {
        this.ctx.save()
        this.ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        this.ctx.font = '12px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          pole.name || `Pole ${index + 1}`,
          pole.x,
          pole.y - 12 - 8
        )
        
        // Show strength
        this.ctx.font = '10px sans-serif'
        this.ctx.fillStyle = isDark ? '#cccccc' : '#666666'
        this.ctx.fillText(
          `${pole.strength.toFixed(1)}`,
          pole.x,
          pole.y + 12 + 16
        )
        this.ctx.restore()
      }
    })
  }

  exportCircularFieldSVG(
    poles: Pole[],
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings
  ): string {
    const svgBuilder = new SVGBuilder(this.width, this.height)

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

        svgBuilder.addCustomPath(
          path,
          'black',
          displaySettings.lineWeight,
          displaySettings.opacity
        )
      })
    }

    // Add poles to SVG using unified utilities
    if (displaySettings.showPoles) {
      poles.forEach((pole, index) => {
        const radius = 12
        const color = pole.isPositive ? '#ef4444' : '#3b82f6'
        
        svgBuilder.addCircle(pole.x, pole.y, radius, color, 'black', 2)
        svgBuilder.addText(
          pole.isPositive ? '+' : '−',
          pole.x, 
          pole.y + 4, 
          'white',
          14
        )
        
        if (displaySettings.showPoleLabels) {
          svgBuilder.addText(
            pole.name || `Pole ${index + 1}`,
            pole.x,
            pole.y - radius - 8,
            'black',
            12
          )
          svgBuilder.addText(
            pole.strength.toFixed(1),
            pole.x,
            pole.y + radius + 16,
            '#666666',
            10
          )
        }
      })
    }

    return svgBuilder.build()
  }
} 