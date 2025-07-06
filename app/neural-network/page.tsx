'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Brain, Zap, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import NeuralNetworkSettings from '@/components/neural-network/NeuralNetworkSettings'
import NetworkControls from '@/components/neural-network/NetworkControls'
import AnimationControls from '@/components/neural-network/AnimationControls'
import type { NeuralNetworkAnimationSettings, NeuralNetworkPanelState } from '@/lib/types'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface NeuralNode {
  id: string
  x: number
  y: number
  layer: number
  activation: number
  bias: number
  connections: Array<{
    targetId: string
    weight: number
    isActive: boolean
  }>
  isInput: boolean
  isOutput: boolean
  pulse: number
}

interface TrainingData {
  inputs: number[]
  outputs: number[]
}

export default function NeuralNetworkPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  // Network state
  const [nodes, setNodes] = useState<NeuralNode[]>([])
  const [layers, setLayers] = useState([3, 4, 3, 2]) // Input, hidden, output
  const [isTraining, setIsTraining] = useState(false)
  const [trainingData, setTrainingData] = useState<TrainingData[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [learningRate, setLearningRate] = useState(0.1)

  // Display settings
  const [showWeights, setShowWeights] = useState(true)
  const [showActivations, setShowActivations] = useState(true)
  const [showPulses, setShowPulses] = useState(true)
  const [nodeSize, setNodeSize] = useState(20)
  const [connectionOpacity, setConnectionOpacity] = useState(0.6)

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<NeuralNetworkAnimationSettings>({
    isAnimating: true,
    pulseSpeed: 2,
    learningSpeed: 1,
    time: 0
  })

  // Panel state
  const [panelState, setPanelState] = useState<NeuralNetworkPanelState>({
    isOpen: true,
    networkSettingsExpanded: true,
    trainingExpanded: true,
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

  // Generate neural network
  const generateNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    
    const newNodes: NeuralNode[] = []
    let nodeId = 0

    // Calculate layer spacing
    const layerSpacing = width / (layers.length + 1)
    
    layers.forEach((layerSize, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1)
      const nodeSpacing = height / (layerSize + 1)
      
      for (let i = 0; i < layerSize; i++) {
        const nodeY = nodeSpacing * (i + 1)
        const isInput = layerIndex === 0
        const isOutput = layerIndex === layers.length - 1
        
        newNodes.push({
          id: `node-${nodeId}`,
          x: layerX,
          y: nodeY,
          layer: layerIndex,
          activation: Math.random() * 0.5 + 0.25,
          bias: (Math.random() - 0.5) * 2,
          connections: [],
          isInput,
          isOutput,
          pulse: 0
        })
        nodeId++
      }
    })

    // Create connections between layers
    newNodes.forEach(node => {
      if (node.layer < layers.length - 1) {
        const nextLayerNodes = newNodes.filter(n => n.layer === node.layer + 1)
        nextLayerNodes.forEach(targetNode => {
          node.connections.push({
            targetId: targetNode.id,
            weight: (Math.random() - 0.5) * 2,
            isActive: false
          })
        })
      }
    })

    setNodes(newNodes)
  }

  // Initialize network
  useEffect(() => {
    if (!isClient) return
    generateNetwork()
    
    // Generate some training data
    const data: TrainingData[] = []
    for (let i = 0; i < 10; i++) {
      data.push({
        inputs: [Math.random(), Math.random(), Math.random()],
        outputs: [Math.random(), Math.random()]
      })
    }
    setTrainingData(data)
  }, [isClient, layers])

  // Forward propagation
  const forwardPropagate = (inputs: number[]) => {
    const newNodes = [...nodes]
    
    // Set input activations
    const inputNodes = newNodes.filter(n => n.isInput)
    inputNodes.forEach((node, i) => {
      node.activation = inputs[i] || 0
      node.pulse = 1
    })

    // Propagate through layers
    for (let layer = 1; layer < layers.length; layer++) {
      const layerNodes = newNodes.filter(n => n.layer === layer)
      const prevLayerNodes = newNodes.filter(n => n.layer === layer - 1)
      
      layerNodes.forEach(node => {
        let sum = node.bias
        
        prevLayerNodes.forEach(prevNode => {
          const connection = prevNode.connections.find(c => c.targetId === node.id)
          if (connection) {
            sum += prevNode.activation * connection.weight
            connection.isActive = true
          }
        })
        
        // Sigmoid activation
        node.activation = 1 / (1 + Math.exp(-sum))
        node.pulse = 1
      })
    }
    
    setNodes(newNodes)
    return newNodes.filter(n => n.isOutput).map(n => n.activation)
  }

  // Training loop
  useEffect(() => {
    if (!isTraining || !isClient) return

    const train = () => {
      trainingData.forEach((data, index) => {
        setTimeout(() => {
          const outputs = forwardPropagate(data.inputs)
          setCurrentEpoch(prev => prev + 1)
        }, index * 100)
      })
    }

    const interval = setInterval(train, trainingData.length * 100 + 500)
    return () => clearInterval(interval)
  }, [isTraining, trainingData, isClient])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    let frameId: number | null = null

    const animate = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          pulse: Math.max(0, node.pulse - 0.02 * animationSettings.pulseSpeed),
          connections: node.connections.map(conn => ({
            ...conn,
            isActive: conn.isActive ? Math.random() > 0.95 : false
          }))
        }))
      )

      setAnimationSettings(prev => ({ ...prev, time: prev.time + 0.02 }))
      
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
  }, [animationSettings.isAnimating, animationSettings.pulseSpeed, isClient])

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

    const render = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Draw connections
      nodes.forEach(node => {
        node.connections.forEach(connection => {
          const targetNode = nodes.find(n => n.id === connection.targetId)
          if (!targetNode) return

          const weight = connection.weight
          const isActive = connection.isActive
          
          // Color based on weight
          let color: string
          if (weight > 0) {
            color = isDark ? `rgba(34, 197, 94, ${connectionOpacity * (isActive ? 1 : 0.3)})` : `rgba(22, 163, 74, ${connectionOpacity * (isActive ? 1 : 0.3)})`
          } else {
            color = isDark ? `rgba(239, 68, 68, ${connectionOpacity * (isActive ? 1 : 0.3)})` : `rgba(220, 38, 38, ${connectionOpacity * (isActive ? 1 : 0.3)})`
          }

          ctx.strokeStyle = color
          ctx.lineWidth = Math.abs(weight) * 3 + 1
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()

          // Draw weight value
          if (showWeights) {
            const midX = (node.x + targetNode.x) / 2
            const midY = (node.y + targetNode.y) / 2
            ctx.fillStyle = isDark ? '#ffffff' : '#000000'
            ctx.font = '10px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(weight.toFixed(2), midX, midY)
          }
        })
      })

      // Draw nodes
      nodes.forEach(node => {
        const activation = node.activation
        const pulse = node.pulse
        
        // Node color based on activation
        let color: string
        if (node.isInput) {
          color = isDark ? '#3b82f6' : '#1d4ed8'
        } else if (node.isOutput) {
          color = isDark ? '#10b981' : '#059669'
        } else {
          const intensity = Math.floor(activation * 255)
          color = isDark ? `rgb(${intensity}, ${intensity}, 255)` : `rgb(0, 0, ${intensity})`
        }

        // Draw node
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize + pulse * 5, 0, 2 * Math.PI)
        ctx.fill()

        // Draw node border
        ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw activation value
        if (showActivations) {
          ctx.fillStyle = isDark ? '#ffffff' : '#000000'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(activation.toFixed(2), node.x, node.y + 4)
        }

        // Draw pulse effect
        if (showPulses && pulse > 0) {
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(node.x, node.y, nodeSize + pulse * 15, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })

      // Draw layer labels
      const layerSpacing = (canvas.width / window.devicePixelRatio) / (layers.length + 1)
      layers.forEach((layerSize, layerIndex) => {
        const layerX = layerSpacing * (layerIndex + 1)
        const label = layerIndex === 0 ? 'Input' : layerIndex === layers.length - 1 ? 'Output' : `Hidden ${layerIndex}`
        
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, layerX, 30)
      })
    }

    // Initial render
    render()

    // Set up animation loop for continuous rendering
    if (animationSettings.isAnimating) {
      const animate = () => {
        render()
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }
  }, [nodes, showWeights, showActivations, showPulses, nodeSize, connectionOpacity, animationSettings, theme, isClient])

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${nodes.map(node => `
          <circle cx="${node.x}" cy="${node.y}" r="${nodeSize}" fill="${node.isInput ? '#3b82f6' : node.isOutput ? '#10b981' : '#6b7280'}"/>
        `).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'neural-network.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setLayers([3, 4, 3, 2])
    setAnimationSettings({
      isAnimating: true,
      pulseSpeed: 2,
      learningSpeed: 1,
      time: 0
    })
    setShowWeights(true)
    setShowActivations(true)
    setShowPulses(true)
    setNodeSize(20)
    setConnectionOpacity(0.6)
    setLearningRate(0.1)
    setIsTraining(false)
    setCurrentEpoch(0)
  }

  // Test network
  const testNetwork = () => {
    const testInputs = [0.5, 0.3, 0.8]
    const outputs = forwardPropagate(testInputs)
    console.log('Network outputs:', outputs)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading neural network visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Neural Network | 
          Nodes: {nodes.length} | 
          Connections: {nodes.reduce((sum, node) => sum + node.connections.length, 0)} | 
          Epoch: {currentEpoch} | 
          Training: {isTraining ? 'On' : 'Off'}
        </>
      }
      helpText="Watch the neural network learn and propagate signals through layers"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <NeuralNetworkSettings
            layers={layers}
            showWeights={showWeights}
            showActivations={showActivations}
            showPulses={showPulses}
            nodeSize={nodeSize}
            connectionOpacity={connectionOpacity}
            expanded={panelState.networkSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, networkSettingsExpanded: !prev.networkSettingsExpanded 
            }))}
            onSetLayers={setLayers}
            onSetShowWeights={setShowWeights}
            onSetShowActivations={setShowActivations}
            onSetShowPulses={setShowPulses}
            onSetNodeSize={setNodeSize}
            onSetConnectionOpacity={setConnectionOpacity}
          />

          <NetworkControls
            isTraining={isTraining}
            learningRate={learningRate}
            currentEpoch={currentEpoch}
            expanded={panelState.trainingExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, trainingExpanded: !prev.trainingExpanded 
            }))}
            onSetIsTraining={setIsTraining}
            onSetLearningRate={setLearningRate}
            onTestNetwork={testNetwork}
            onGenerateNetwork={generateNetwork}
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