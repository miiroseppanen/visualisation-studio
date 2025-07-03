import type { TurbulenceSettings, NoiseSettings, FlowSettings, TurbulenceAnimationSettings } from './types'
import type { TurbulenceSource } from './turbulence-physics'
import { calculateTurbulenceAt, generateStreamline } from './turbulence-physics'

export class TurbulenceRenderer {
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

  renderField(
    sources: TurbulenceSource[],
    turbulenceSettings: TurbulenceSettings,
    noiseSettings: NoiseSettings,
    flowSettings: FlowSettings,
    animationSettings: TurbulenceAnimationSettings
  ): void {
    this.clear()

    if (turbulenceSettings.streamlineMode) {
      this.renderStreamlines(sources, turbulenceSettings, noiseSettings, flowSettings, animationSettings)
    } else {
      this.renderVectorField(sources, turbulenceSettings, noiseSettings, flowSettings, animationSettings)
    }

    if (turbulenceSettings.showSources) {
      this.renderSources(sources)
    }
  }

  private renderVectorField(
    sources: TurbulenceSource[],
    turbulenceSettings: TurbulenceSettings,
    noiseSettings: NoiseSettings,
    flowSettings: FlowSettings,
    animationSettings: TurbulenceAnimationSettings
  ): void {
    const spacing = Math.sqrt((this.width * this.height) / turbulenceSettings.lineCount)
    const cols = Math.floor(this.width / spacing)
    const rows = Math.floor(this.height / spacing)

    this.ctx.strokeStyle = '#000000'
    this.ctx.lineWidth = 0.5
    this.ctx.globalAlpha = 0.8

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2
        const y = row * spacing + spacing / 2

        const field = calculateTurbulenceAt(
          x, y, sources, noiseSettings, flowSettings, animationSettings.time
        )

        // Scale and apply intensity
        const magnitude = Math.sqrt(field.fieldX * field.fieldX + field.fieldY * field.fieldY)
        const scaledMagnitude = Math.min(magnitude * animationSettings.intensity, turbulenceSettings.lineLength)
        
        if (scaledMagnitude > 0.1) {
          const normalizedX = field.fieldX / magnitude
          const normalizedY = field.fieldY / magnitude
          
          const endX = x + normalizedX * scaledMagnitude
          const endY = y + normalizedY * scaledMagnitude
          
          // Simple black line without arrows
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
          this.ctx.lineTo(endX, endY)
          this.ctx.stroke()
        }
      }
    }

    this.ctx.globalAlpha = 1
  }

  private renderStreamlines(
    sources: TurbulenceSource[],
    turbulenceSettings: TurbulenceSettings,
    noiseSettings: NoiseSettings,
    flowSettings: FlowSettings,
    animationSettings: TurbulenceAnimationSettings
  ): void {
    const streamlineCount = Math.floor(turbulenceSettings.lineCount / 100) // Fewer streamlines than vectors
    const spacing = Math.sqrt((this.width * this.height) / streamlineCount)

    this.ctx.strokeStyle = '#000000'
    this.ctx.lineWidth = 0.8
    this.ctx.globalAlpha = 0.9

    for (let i = 0; i < streamlineCount; i++) {
      // Distribute start points across the canvas
      const startX = (i % Math.floor(Math.sqrt(streamlineCount))) * spacing + Math.random() * spacing
      const startY = Math.floor(i / Math.floor(Math.sqrt(streamlineCount))) * spacing + Math.random() * spacing

      if (startX >= this.width || startY >= this.height) continue

      const points = generateStreamline(
        startX, startY, sources, noiseSettings, flowSettings, 
        animationSettings.time, 100, 2
      )

      if (points.length > 5) {
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)

        // Draw smooth curve through points
        for (let j = 1; j < points.length - 1; j++) {
          const currentPoint = points[j]
          const nextPoint = points[j + 1]
          const cpX = (currentPoint.x + nextPoint.x) / 2
          const cpY = (currentPoint.y + nextPoint.y) / 2
          this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, cpX, cpY)
        }

        this.ctx.stroke()
      }
    }

    this.ctx.globalAlpha = 1
  }

  private renderSources(sources: TurbulenceSource[]): void {
    sources.forEach(source => {
      this.ctx.save()
      
      const radius = 6
      
      // Draw source as black circle with white outline
      this.ctx.fillStyle = '#000000'
      this.ctx.strokeStyle = '#ffffff'
      this.ctx.lineWidth = 2
      
      this.ctx.beginPath()
      this.ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.stroke()
      
      // Draw type indicator in white
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = '10px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      
      const symbols = {
        vortex: '⟲',
        source: '+',
        sink: '−',
        uniform: '→'
      }
      
      this.ctx.fillText(symbols[source.type], source.x, source.y)
      
      // Draw name label in black
      this.ctx.fillStyle = '#000000'
      this.ctx.font = '10px sans-serif'
      this.ctx.fillText(source.name, source.x, source.y + radius + 12)
      
      this.ctx.restore()
    })
  }

  exportAsSVG(
    sources: TurbulenceSource[],
    turbulenceSettings: TurbulenceSettings,
    noiseSettings: NoiseSettings,
    flowSettings: FlowSettings,
    animationSettings: TurbulenceAnimationSettings
  ): string {
    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">\n`
    svg += `<rect width="${this.width}" height="${this.height}" fill="white"/>\n`

    // Generate field lines for SVG
    if (turbulenceSettings.streamlineMode) {
      const streamlineCount = Math.floor(turbulenceSettings.lineCount / 100)
      const spacing = Math.sqrt((this.width * this.height) / streamlineCount)

      for (let i = 0; i < streamlineCount; i++) {
        const startX = (i % Math.floor(Math.sqrt(streamlineCount))) * spacing
        const startY = Math.floor(i / Math.floor(Math.sqrt(streamlineCount))) * spacing

        if (startX >= this.width || startY >= this.height) continue

        const points = generateStreamline(
          startX, startY, sources, noiseSettings, flowSettings, 
          animationSettings.time, 100, 2
        )

        if (points.length > 5) {
          let path = `M${points[0].x},${points[0].y}`
          
          for (let j = 1; j < points.length - 1; j++) {
            const currentPoint = points[j]
            const nextPoint = points[j + 1]
            const cpX = (currentPoint.x + nextPoint.x) / 2
            const cpY = (currentPoint.y + nextPoint.y) / 2
            path += ` Q${currentPoint.x},${currentPoint.y} ${cpX},${cpY}`
          }

          svg += `<path d="${path}" stroke="black" fill="none" stroke-width="0.8" opacity="0.9"/>\n`
        }
      }
    } else {
      // Vector field for SVG
      const spacing = Math.sqrt((this.width * this.height) / turbulenceSettings.lineCount)
      const cols = Math.floor(this.width / spacing)
      const rows = Math.floor(this.height / spacing)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + spacing / 2
          const y = row * spacing + spacing / 2

          const field = calculateTurbulenceAt(
            x, y, sources, noiseSettings, flowSettings, animationSettings.time
          )

          const magnitude = Math.sqrt(field.fieldX * field.fieldX + field.fieldY * field.fieldY)
          const scaledMagnitude = Math.min(magnitude * animationSettings.intensity, turbulenceSettings.lineLength)
          
          if (scaledMagnitude > 0.1) {
            const normalizedX = field.fieldX / magnitude
            const normalizedY = field.fieldY / magnitude
            
            const endX = x + normalizedX * scaledMagnitude
            const endY = y + normalizedY * scaledMagnitude
            
            svg += `<line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" stroke="black" stroke-width="0.5" opacity="0.8"/>\n`
          }
        }
      }
    }

    // Add sources to SVG
    if (turbulenceSettings.showSources) {
      sources.forEach(source => {
        svg += `<circle cx="${source.x}" cy="${source.y}" r="6" fill="black" stroke="white" stroke-width="2"/>\n`
        
        const symbols = {
          vortex: '⟲',
          source: '+',
          sink: '−',
          uniform: '→'
        }
        
        svg += `<text x="${source.x}" y="${source.y + 3}" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">${symbols[source.type]}</text>\n`
        svg += `<text x="${source.x}" y="${source.y + 18}" text-anchor="middle" fill="black" font-size="10" font-family="sans-serif">${source.name}</text>\n`
      })
    }

    svg += '</svg>'
    return svg
  }
} 