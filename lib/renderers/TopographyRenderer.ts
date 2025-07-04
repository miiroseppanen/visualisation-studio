import { BaseRenderer, SVGBuilder, type SVGExportConfig } from '../unified-renderer'
import type { TopographyDisplaySettings } from '../types'
import type { ElevationPoint, TopographySettings, ContourLine } from '../topography-physics'
import { generateAllContourLines, calculateGradientAt } from '../topography-physics'

interface TopographyRenderData {
  elevationPoints: ElevationPoint[]
  topographySettings: TopographySettings
}

export class TopographyRenderer extends BaseRenderer {
  // Implementation of abstract methods
  render(data: TopographyRenderData, settings: TopographyDisplaySettings): void {
    this.renderTopography(data.elevationPoints, data.topographySettings, settings)
  }

  exportSVG(data: TopographyRenderData, settings: TopographyDisplaySettings, config: SVGExportConfig): string {
    return this.exportTopographySVG(data.elevationPoints, data.topographySettings, settings)
  }

  // Topography-specific rendering methods
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
      // Draw elevation point
      this.ctx.fillStyle = point.type === 'peak' ? '#ff4444' : point.type === 'valley' ? '#4444ff' : '#44ff44'
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
      this.ctx.fill()

      // Draw elevation point border
      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      // Draw elevation point label
      if (displaySettings.showElevationLabels) {
        this.ctx.fillStyle = '#000000'
        this.ctx.font = '12px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'top'
        this.ctx.fillText(point.name, point.x, point.y + 12)
        this.ctx.fillText(`${point.elevation}m`, point.x, point.y + 26)
      }
    })
  }

  exportTopographySVG(
    elevationPoints: ElevationPoint[],
    topographySettings: TopographySettings,
    displaySettings: TopographyDisplaySettings
  ): string {
    const svgBuilder = new SVGBuilder(this.width, this.height)

    // Add contour lines to SVG
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

        let path = `M${contour.points[0].x},${contour.points[0].y}`
        
        for (let i = 1; i < contour.points.length; i++) {
          path += ` L${contour.points[i].x},${contour.points[i].y}`
        }
        
        if (contour.closed) {
          path += ' Z'
        }

        const strokeWidth = isMajorContour ? displaySettings.majorContourWeight : displaySettings.lineWeight
        const opacity = displaySettings.majorContourInterval === 0 ? 1.0 : (isMajorContour ? 1.0 : 0.7)
        
        svgBuilder.addCustomPath(path, '#000000', strokeWidth, opacity)

        // Add elevation labels for major contours
        if (isMajorContour && displaySettings.showElevationLabels && contour.points.length > 10) {
          const midIndex = Math.floor(contour.points.length / 2)
          const labelPoint = contour.points[midIndex]
          svgBuilder.addText(
            `${Math.round(contour.elevation)}m`,
            labelPoint.x,
            labelPoint.y,
            '#000000',
            10
          )
        }
      })
    }

    // Add elevation points to SVG
    if (displaySettings.showElevationPoints) {
      elevationPoints.forEach(point => {
        const color = point.type === 'peak' ? '#ff4444' : point.type === 'valley' ? '#4444ff' : '#44ff44'
        svgBuilder.addCircle(point.x, point.y, 8, color, '#000000', 2)

        if (displaySettings.showElevationLabels) {
          svgBuilder.addText(point.name, point.x, point.y + 12, '#000000', 12)
          svgBuilder.addText(`${point.elevation}m`, point.x, point.y + 26, '#000000', 12)
        }
      })
    }

    return svgBuilder.build()
  }
} 