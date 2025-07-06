'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Volume2, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import SoundWaveSettings from '@/components/sound-wave/SoundWaveSettings'
import FrequencyControls from '@/components/sound-wave/FrequencyControls'
import AnimationControls from '@/components/sound-wave/AnimationControls'
import type { SoundWaveAnimationSettings, SoundWavePanelState } from '@/lib/types'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface WavePoint {
  x: number
  y: number
  amplitude: number
  frequency: number
  phase: number
}

interface FrequencyBin {
  frequency: number
  magnitude: number
  phase: number
}

export default function SoundWavePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  // Wave state
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  const [frequencyBins, setFrequencyBins] = useState<FrequencyBin[]>([])
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isListening, setIsListening] = useState(false)

  // Wave settings
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sine')
  const [baseFrequency, setBaseFrequency] = useState(440)
  const [harmonics, setHarmonics] = useState(5)
  const [noiseLevel, setNoiseLevel] = useState(0.1)

  // Display settings
  const [showWaveform, setShowWaveform] = useState(true)
  const [showSpectrum, setShowSpectrum] = useState(true)
  const [showHarmonics, setShowHarmonics] = useState(true)
  const [waveformStyle, setWaveformStyle] = useState<'line' | 'bars' | 'circles'>('line')

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<SoundWaveAnimationSettings>({
    isAnimating: true,
    frequency: 440,
    amplitude: 1.0,
    waveSpeed: 1.0,
    time: 0
  })

  // Panel state
  const [panelState, setPanelState] = useState<SoundWavePanelState>({
    isOpen: true,
    waveSettingsExpanded: true,
    frequencyExpanded: true,
    animationExpanded: true
  })

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Canvas setup
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.canvas.style.width = rect.width + 'px'
      ctx.canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [isClient])

  // Initialize audio context
  const initializeAudio = async () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyserNode = context.createAnalyser()
      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = 0.8

      setAudioContext(context)
      setAnalyser(analyserNode)
      setIsListening(true)
    } catch (error) {
      console.error('Audio initialization failed:', error)
    }
  }

  // Generate synthetic wave data
  const generateWaveData = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    const points: WavePoint[] = []
    const bins: FrequencyBin[] = []

    // Generate wave points
    for (let x = 0; x < width; x += 2) {
      let y = height / 2
      let amplitude = 0
      let frequency = baseFrequency

      // Add harmonics
      for (let h = 1; h <= harmonics; h++) {
        const harmonicFreq = baseFrequency * h
        const harmonicAmp = 1 / h
        const phase = (x / width) * 2 * Math.PI * h + animationSettings.time * animationSettings.waveSpeed
        
        let harmonicY = 0
        switch (waveType) {
          case 'sine':
            harmonicY = Math.sin(phase) * harmonicAmp
            break
          case 'square':
            harmonicY = Math.sign(Math.sin(phase)) * harmonicAmp
            break
          case 'sawtooth':
            harmonicY = ((phase % (2 * Math.PI)) / Math.PI - 1) * harmonicAmp
            break
          case 'triangle':
            harmonicY = (2 * Math.abs((phase % (2 * Math.PI)) / Math.PI - 1) - 1) * harmonicAmp
            break
        }
        
        y += harmonicY * (height / 4) * animationSettings.amplitude
        amplitude += harmonicAmp
      }

      // Add noise
      if (noiseLevel > 0) {
        y += (Math.random() - 0.5) * height * noiseLevel
      }

      points.push({
        x,
        y,
        amplitude,
        frequency: baseFrequency,
        phase: (x / width) * 2 * Math.PI + animationSettings.time * animationSettings.waveSpeed
      })
    }

    // Generate frequency bins
    for (let i = 0; i < 64; i++) {
      const freq = baseFrequency * (i + 1) / 8
      const magnitude = i < harmonics ? 1 / (i + 1) : 0
      bins.push({
        frequency: freq,
        magnitude: magnitude * animationSettings.amplitude,
        phase: animationSettings.time * freq * 0.01
      })
    }

    setWavePoints(points)
    setFrequencyBins(bins)
  }

  // Update wave data
  useEffect(() => {
    if (!isClient) return
    generateWaveData()
  }, [isClient, baseFrequency, harmonics, waveType, noiseLevel, animationSettings])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    let frameId: number | null = null

    const animate = () => {
      setAnimationSettings(prev => ({ ...prev, time: prev.time + 0.02 * prev.waveSpeed }))
      generateWaveData()
      
      frameId = requestAnimationFrame(animate)
      animationRef.current = frameId
      registerAnimationFrame(frameId)
    }

    frameId = requestAnimationFrame(animate)
    animationRef.current = frameId
    registerAnimationFrame(frameId)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
        unregisterAnimationFrame(frameId)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [animationSettings.isAnimating, animationSettings.waveSpeed, isClient])

  // Handle pause all animations
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }

    const handleBeforeUnload = () => {
      handlePauseAllAnimations()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePauseAllAnimations()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      handlePauseAllAnimations()
    }
  }, [])

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    // Draw waveform
    if (showWaveform && wavePoints.length > 0) {
      switch (waveformStyle) {
        case 'line':
          ctx.strokeStyle = isDark ? '#3b82f6' : '#1d4ed8'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(wavePoints[0].x, wavePoints[0].y)
          wavePoints.forEach(point => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
          break

        case 'bars':
          wavePoints.forEach(point => {
            const barHeight = Math.abs(point.y - height / 2) * 2
            const barY = point.y > height / 2 ? height / 2 : point.y
            const intensity = point.amplitude / harmonics
            
            ctx.fillStyle = isDark 
              ? `rgba(59, 130, 246, ${intensity})`
              : `rgba(29, 78, 216, ${intensity})`
            ctx.fillRect(point.x - 1, barY, 2, barHeight)
          })
          break

        case 'circles':
          wavePoints.forEach((point, index) => {
            if (index % 4 === 0) { // Skip some points for performance
              const radius = Math.abs(point.y - height / 2) * 0.1 + 2
              const intensity = point.amplitude / harmonics
              
              ctx.fillStyle = isDark 
                ? `rgba(59, 130, 246, ${intensity})`
                : `rgba(29, 78, 216, ${intensity})`
              ctx.beginPath()
              ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
              ctx.fill()
            }
          })
          break
      }
    }

    // Draw frequency spectrum
    if (showSpectrum && frequencyBins.length > 0) {
      const spectrumWidth = width * 0.8
      const spectrumHeight = height * 0.3
      const spectrumX = width * 0.1
      const spectrumY = height * 0.7
      const binWidth = spectrumWidth / frequencyBins.length

      frequencyBins.forEach((bin, index) => {
        const barHeight = bin.magnitude * spectrumHeight
        const barX = spectrumX + index * binWidth
        const barY = spectrumY + spectrumHeight - barHeight
        
        // Color based on frequency
        const hue = (bin.frequency / 1000) * 360 % 360
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fillRect(barX, barY, binWidth - 1, barHeight)
      })
    }

    // Draw harmonics visualization
    if (showHarmonics) {
      const harmonicsY = height * 0.1
      const harmonicsHeight = height * 0.2
      
      for (let h = 1; h <= harmonics; h++) {
        const harmonicFreq = baseFrequency * h
        const harmonicAmp = 1 / h
        const x = (h / harmonics) * width * 0.8 + width * 0.1
        const y = harmonicsY + harmonicsHeight / 2
        
        // Draw harmonic circle
        const radius = harmonicAmp * 20
        const hue = (harmonicFreq / 1000) * 360 % 360
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw frequency label
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${harmonicFreq.toFixed(0)}Hz`, x, y + 25)
      }
    }

    // Draw center line
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

  }, [wavePoints, frequencyBins, showWaveform, showSpectrum, showHarmonics, waveformStyle, theme, isClient])

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <polyline points="${wavePoints.map(p => `${p.x},${p.y}`).join(' ')}" 
                  fill="none" stroke="blue" stroke-width="2"/>
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sound-wave.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setWaveType('sine')
    setBaseFrequency(440)
    setHarmonics(5)
    setNoiseLevel(0.1)
    setAnimationSettings({
      isAnimating: true,
      frequency: 440,
      amplitude: 1.0,
      waveSpeed: 1.0,
      time: 0
    })
    setShowWaveform(true)
    setShowSpectrum(true)
    setShowHarmonics(true)
    setWaveformStyle('line')
    setIsListening(false)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading sound wave visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Sound Wave | 
          Frequency: {baseFrequency}Hz | 
          Harmonics: {harmonics} | 
          Type: {waveType} | 
          Audio: {isListening ? 'On' : 'Off'}
        </>
      }
      helpText="Watch sound waves and harmonics • Try different wave types • Analyze frequency spectrum"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <SoundWaveSettings
            waveType={waveType}
            baseFrequency={baseFrequency}
            harmonics={harmonics}
            noiseLevel={noiseLevel}
            showWaveform={showWaveform}
            showSpectrum={showSpectrum}
            showHarmonics={showHarmonics}
            waveformStyle={waveformStyle}
            expanded={panelState.waveSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, waveSettingsExpanded: !prev.waveSettingsExpanded 
            }))}
            onSetWaveType={setWaveType}
            onSetBaseFrequency={setBaseFrequency}
            onSetHarmonics={setHarmonics}
            onSetNoiseLevel={setNoiseLevel}
            onSetShowWaveform={setShowWaveform}
            onSetShowSpectrum={setShowSpectrum}
            onSetShowHarmonics={setShowHarmonics}
            onSetWaveformStyle={setWaveformStyle}
          />

          <FrequencyControls
            onInitializeAudio={initializeAudio}
            isListening={isListening}
            expanded={panelState.frequencyExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, frequencyExpanded: !prev.frequencyExpanded 
            }))}
          />

          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={resetToDefaults}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, animationExpanded: !prev.animationExpanded 
            }))}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair dark:invert dark:hue-rotate-180"
      />
    </VisualizationLayout>
  )
} 