import { BaseRenderer, SVGBuilder, type SVGExportConfig } from '../unified-renderer'
import type { Pole } from '../types'
import type { CircularFieldLine } from '../circular-field-physics'
import type { CircularFieldDisplaySettings } from '../types'
import { getColorPalette } from '../constants'

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
    theme: 'light' | 'dark' | 'system' | 'pastel' = 'light'
  ): void {
    this.clear()

    // Determine the actual theme being used
    let resolvedTheme: 'light' | 'dark' | 'pastel' = 'light'
    if (theme === 'pastel') {
      resolvedTheme = 'pastel'
    } else if (theme === 'dark') {
      resolvedTheme = 'dark'
    } else if (theme === 'system') {
      const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      resolvedTheme = isDark ? 'dark' : 'light'
    }

    // Get appropriate color palette
    const colorPalette = getColorPalette(resolvedTheme)

    // Render field lines first (so poles appear on top)
    if (displaySettings.showFieldLines) {
      this.renderFieldLines(fieldLines, displaySettings, resolvedTheme, colorPalette)
    }

    // Render poles using unified utilities
    if (displaySettings.showPoles) {
      this.renderPoles(poles, displaySettings, resolvedTheme, colorPalette)
    }
  }

  private renderFieldLines(
    fieldLines: CircularFieldLine[],
    displaySettings: CircularFieldDisplaySettings,
    theme: 'light' | 'dark' | 'pastel',
    colorPalette: any
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
      let strokeColor: string
      if (theme === 'pastel') {
        // Use soft colors for pastel theme - alternate between positive and negative colors
        strokeColor = line.intensity > 0 ? colorPalette.positive : colorPalette.negative
      } else {
        // Use black/white for other themes
        strokeColor = theme === 'dark' ? '#ffffff' : '#000000'
      }
      
      this.ctx.strokeStyle = strokeColor
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
    theme: 'light' | 'dark' | 'pastel',
    colorPalette: any
  ): void {
    poles.forEach((pole, index) => {
      this.ctx.save()
      
      const radius = Math.max(3, Math.min(15, pole.strength * 0.3))
      
      // Use theme-appropriate colors
      let fillColor: string
      let strokeColor: string
      
      if (theme === 'pastel') {
        fillColor = pole.isPositive ? colorPalette.positive : colorPalette.negative
        strokeColor = '#ffffff'
      } else {
        fillColor = pole.isPositive ? '#ef4444' : '#3b82f6'
        strokeColor = theme === 'dark' ? '#ffffff' : '#000000'
      }
      
      // Draw pole
      this.ctx.fillStyle = fillColor
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = 2
      
      this.ctx.beginPath()
      this.ctx.arc(pole.x, pole.y, radius, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.stroke()
      
      // Draw pole symbol
      const symbol = pole.isPositive ? '+' : '−'
      this.ctx.fillStyle = strokeColor
      this.ctx.font = 'bold 12px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(symbol, pole.x, pole.y)
      
      this.ctx.restore()

      // Add pole label if enabled (specific to circular field)
      if (displaySettings.showPoleLabels) {
        this.ctx.save()
        this.ctx.fillStyle = strokeColor
        this.ctx.font = '12px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          pole.name || `Pole ${index + 1}`,
          pole.x,
          pole.y - 12 - 8
        )
        
        // Show strength
        this.ctx.font = '10px sans-serif'
        this.ctx.fillStyle = '#666666'
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