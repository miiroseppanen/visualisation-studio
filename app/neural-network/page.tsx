'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, RotateCcw, Brain, Zap, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import NeuralNetworkSettings from '@/components/neural-network/NeuralNetworkSettings'
import NetworkControls from '@/components/neural-network/NetworkControls'
import AnimationControls from '@/components/neural-network/AnimationControls'
import { FullScreenLoader } from '@/components/ui/loader'
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
    weightChange: number
    learningPulse: number
  }>
  isInput: boolean
  isOutput: boolean
  pulse: number
  error: number
  targetActivation: number
}

interface TrainingData {
  inputs: number[]
  outputs: number[]
}

export default function NeuralNetworkPage() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderFrameRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  // Network state
  const [nodes, setNodes] = useState<NeuralNode[]>([])
  const [layers, setLayers] = useState([3, 4, 3, 2]) // Input, hidden, output
  const [isTraining, setIsTraining] = useState(false)
  const [trainingData, setTrainingData] = useState<TrainingData[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [learningRate, setLearningRate] = useState(0.1)
  const [currentTrainingIndex, setCurrentTrainingIndex] = useState(0)
  const [trainingError, setTrainingError] = useState(0)
  const [isLearning, setIsLearning] = useState(false)

  // Display settings
  const [showWeights, setShowWeights] = useState(false)
  const [showActivations, setShowActivations] = useState(false)
  const [showPulses, setShowPulses] = useState(true)
  const [nodeSize, setNodeSize] = useState(16)
  const [connectionOpacity, setConnectionOpacity] = useState(0.7)
  const [showErrors, setShowErrors] = useState(true)

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

  // Memoized network generation
  const generateNetwork = useCallback(() => {
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
          pulse: 0,
          error: 0,
          targetActivation: 0
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
            isActive: false,
            weightChange: 0,
            learningPulse: 0
          })
        })
      }
    })

    setNodes(newNodes)
  }, [layers])

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
  }, [isClient, generateNetwork])

  // Memoized forward propagation with enhanced visual feedback
  const forwardPropagate = useCallback((inputs: number[], targets?: number[]) => {
    const newNodes = [...nodes]
    
    // Set input activations
    const inputNodes = newNodes.filter(n => n.isInput)
    inputNodes.forEach((node, i) => {
      node.activation = inputs[i] || 0
      node.pulse = 1
      node.targetActivation = inputs[i] || 0
    })

    // Set target activations for output nodes
    if (targets) {
      const outputNodes = newNodes.filter(n => n.isOutput)
      outputNodes.forEach((node, i) => {
        node.targetActivation = targets[i] || 0
      })
    }

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
            connection.learningPulse = 1 // Visual feedback for active connections
          }
        })
        
        // Sigmoid activation
        node.activation = 1 / (1 + Math.exp(-sum))
        node.pulse = 1
      })
    }

    // Calculate errors for output nodes
    if (targets) {
      const outputNodes = newNodes.filter(n => n.isOutput)
      outputNodes.forEach((node, i) => {
        node.error = targets[i] - node.activation
      })
    }
    
    setNodes(newNodes)
    return newNodes.filter(n => n.isOutput).map(n => n.activation)
  }, [nodes, layers])

  // Enhanced training with backpropagation and visual feedback
  const trainNetwork = useCallback(() => {
    if (!trainingData.length) return

    const currentData = trainingData[currentTrainingIndex]
    if (!currentData) return

    setIsLearning(true)

    // Forward pass
    const outputs = forwardPropagate(currentData.inputs, currentData.outputs)
    
    // Calculate total error
    const totalError = currentData.outputs.reduce((sum, target, i) => {
      return sum + Math.pow(target - outputs[i], 2) / 2
    }, 0)
    setTrainingError(totalError)

    // Backpropagation with visual weight updates
    setNodes(prevNodes => {
      const newNodes = [...prevNodes]
      
      // Calculate gradients for output layer
      const outputNodes = newNodes.filter(n => n.isOutput)
      outputNodes.forEach((node, i) => {
        const target = currentData.outputs[i]
        const error = target - node.activation
        node.error = error
        node.pulse = Math.abs(error) * 2 // Visual error feedback
      })

      // Backpropagate through hidden layers
      for (let layer = layers.length - 2; layer >= 0; layer--) {
        const layerNodes = newNodes.filter(n => n.layer === layer)
        const nextLayerNodes = newNodes.filter(n => n.layer === layer + 1)
        
        layerNodes.forEach(node => {
          let errorSum = 0
          
          nextLayerNodes.forEach(nextNode => {
            const connection = node.connections.find(c => c.targetId === nextNode.id)
            if (connection) {
              errorSum += nextNode.error * connection.weight
              
              // Update weight with visual feedback
              const weightGradient = nextNode.error * node.activation
              const weightChange = learningRate * weightGradient
              connection.weight += weightChange
              connection.weightChange = weightChange
              connection.learningPulse = Math.abs(weightChange) * 3 // Visual learning feedback
            }
          })
          
          node.error = errorSum * node.activation * (1 - node.activation)
          node.pulse = Math.abs(node.error) * 2
        })
      }

      return newNodes
    })

    // Move to next training example
    setTimeout(() => {
      setCurrentTrainingIndex(prev => (prev + 1) % trainingData.length)
      setIsLearning(false)
    }, 500) // Visual delay to see the learning process
  }, [trainingData, currentTrainingIndex, forwardPropagate, layers, learningRate])

  // Training loop with enhanced visual feedback
  useEffect(() => {
    if (!isTraining || !isClient) return

    const interval = setInterval(() => {
      trainNetwork()
      setCurrentEpoch(prev => prev + 1)
    }, 1000) // Slower training for better visual feedback

    return () => clearInterval(interval)
  }, [isTraining, isClient, trainNetwork])

  // Animation loop with enhanced learning effects
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
            isActive: conn.isActive ? Math.random() > 0.95 : false,
            learningPulse: Math.max(0, conn.learningPulse - 0.05 * animationSettings.learningSpeed),
            weightChange: conn.weightChange * 0.95 // Decay weight changes
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
  }, [animationSettings.isAnimating, animationSettings.pulseSpeed, animationSettings.learningSpeed, isClient])

  // Handle pause all animations
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = undefined
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

  // Memoized render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with subtle background
    ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Draw connections with improved black and white styling and learning effects
    nodes.forEach(node => {
      node.connections.forEach(connection => {
        const targetNode = nodes.find(n => n.id === connection.targetId)
        if (!targetNode) return

        const weight = connection.weight
        const isActive = connection.isActive
        const learningPulse = connection.learningPulse
        const weightChange = connection.weightChange
        
        // Enhanced visual effects for learning
        const baseOpacity = connectionOpacity * (isActive ? 0.8 : 0.3)
        const weightIntensity = Math.abs(weight)
        const learningEffect = learningPulse > 0 ? learningPulse * 0.5 : 0
        
        // Use grayscale for connections with learning highlights
        const intensity = Math.floor(weightIntensity * 255)
        let color: string
        
        if (learningPulse > 0) {
          // Learning pulse effect - bright white flash
          const pulseIntensity = Math.floor(learningPulse * 255)
          color = isDark 
            ? `rgba(${pulseIntensity}, ${pulseIntensity}, ${pulseIntensity}, ${baseOpacity + learningEffect})`
            : `rgba(${255 - pulseIntensity}, ${255 - pulseIntensity}, ${255 - pulseIntensity}, ${baseOpacity + learningEffect})`
        } else {
          color = isDark 
            ? `rgba(${255 - intensity}, ${255 - intensity}, ${255 - intensity}, ${baseOpacity})`
            : `rgba(${intensity}, ${intensity}, ${intensity}, ${baseOpacity})`
        }

        ctx.strokeStyle = color
        const lineWidth = Math.max(0.5, weightIntensity * 4 + 0.5 + learningPulse * 8)
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.stroke()

        // Draw weight change indicator
        if (Math.abs(weightChange) > 0.01) {
          const midX = (node.x + targetNode.x) / 2
          const midY = (node.y + targetNode.y) / 2
          
          // Weight change indicator circle
          const changeSize = Math.abs(weightChange) * 20
          ctx.fillStyle = weightChange > 0 
            ? (isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
            : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')
          ctx.beginPath()
          ctx.arc(midX, midY, changeSize, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw weight value with improved styling
        if (showWeights) {
          const midX = (node.x + targetNode.x) / 2
          const midY = (node.y + targetNode.y) / 2
          
          // Background for text
          const text = weight.toFixed(2)
          ctx.font = 'bold 10px sans-serif'
          const textMetrics = ctx.measureText(text)
          const padding = 4
          
          ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)'
          ctx.fillRect(
            midX - textMetrics.width / 2 - padding,
            midY - 6 - padding,
            textMetrics.width + padding * 2,
            12 + padding * 2
          )
          
          // Text
          ctx.fillStyle = isDark ? '#ffffff' : '#000000'
          ctx.textAlign = 'center'
          ctx.fillText(text, midX, midY)
        }
      })
    })

    // Draw nodes with improved black and white design and learning effects
    nodes.forEach(node => {
      const activation = node.activation
      const pulse = node.pulse
      const error = node.error
      const nodeIsLearning = isLearning && (node.isInput || node.isOutput)
      
      // Node styling based on type, activation, and learning state
      let fillColor: string
      let borderColor: string
      let borderWidth: number
      
      if (nodeIsLearning) {
        // Learning state - bright white flash
        fillColor = isDark ? '#ffffff' : '#000000'
        borderColor = isDark ? '#ffffff' : '#000000'
        borderWidth = 4
      } else if (node.isInput) {
        fillColor = isDark ? '#ffffff' : '#000000'
        borderColor = isDark ? '#ffffff' : '#000000'
        borderWidth = 3
      } else if (node.isOutput) {
        fillColor = isDark ? '#ffffff' : '#000000'
        borderColor = isDark ? '#ffffff' : '#000000'
        borderWidth = 3
      } else {
        // Hidden layer nodes with activation-based intensity
        const intensity = Math.floor(activation * 255)
        fillColor = isDark 
          ? `rgb(${255 - intensity}, ${255 - intensity}, ${255 - intensity})`
          : `rgb(${intensity}, ${intensity}, ${intensity})`
        borderColor = isDark ? '#ffffff' : '#000000'
        borderWidth = 2
      }

      // Error indicator
      if (showErrors && Math.abs(error) > 0.01) {
        const errorSize = Math.abs(error) * 15
        ctx.fillStyle = error > 0 
          ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')
          : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize + errorSize, 0, 2 * Math.PI)
        ctx.fill()
      }

      // Draw node shadow for depth
      ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // Draw node
      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeSize + pulse * 3, 0, 2 * Math.PI)
      ctx.fill()

      // Reset shadow for border
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw node border
      ctx.strokeStyle = borderColor
      ctx.lineWidth = borderWidth
      ctx.lineCap = 'round'
      ctx.stroke()

      // Draw activation value with improved styling
      if (showActivations) {
        const text = activation.toFixed(2)
        ctx.font = 'bold 11px sans-serif'
        const textMetrics = ctx.measureText(text)
        const padding = 3
        
        // Background for text
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(
          node.x - textMetrics.width / 2 - padding,
          node.y + nodeSize + 8 - padding,
          textMetrics.width + padding * 2,
          14 + padding * 2
        )
        
        // Text
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.textAlign = 'center'
        ctx.fillText(text, node.x, node.y + nodeSize + 18)
      }

      // Draw error value if significant
      if (showErrors && Math.abs(error) > 0.01) {
        const text = error.toFixed(3)
        ctx.font = 'bold 10px sans-serif'
        const textMetrics = ctx.measureText(text)
        const padding = 2
        
        // Background for text
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(
          node.x - textMetrics.width / 2 - padding,
          node.y - nodeSize - 20 - padding,
          textMetrics.width + padding * 2,
          12 + padding * 2
        )
        
        // Text
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.textAlign = 'center'
        ctx.fillText(text, node.x, node.y - nodeSize - 12)
      }

      // Draw pulse effect with improved styling
      if (showPulses && pulse > 0) {
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize + pulse * 12, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.setLineDash([])
      }
    })

    // Draw layer labels with improved styling
    const layerSpacing = (canvas.width / window.devicePixelRatio) / (layers.length + 1)
    layers.forEach((layerSize, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1)
      const label = layerIndex === 0 ? 'Input' : layerIndex === layers.length - 1 ? 'Output' : `Hidden ${layerIndex}`
      
      // Label background
      ctx.font = 'bold 14px sans-serif'
      const textMetrics = ctx.measureText(label)
      const padding = 6
      
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(
        layerX - textMetrics.width / 2 - padding,
        20 - padding,
        textMetrics.width + padding * 2,
        20 + padding * 2
      )
      
      // Label text
      ctx.fillStyle = isDark ? '#ffffff' : '#000000'
      ctx.textAlign = 'center'
      ctx.fillText(label, layerX, 35)
    })
  }, [nodes, showWeights, showActivations, showPulses, nodeSize, connectionOpacity, layers, theme])

  // Render loop with proper cleanup
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    // Initial render
    render()

    // Set up animation loop for continuous rendering only when animating
    if (animationSettings.isAnimating) {
      const animate = () => {
        render()
        renderFrameRef.current = requestAnimationFrame(animate)
      }
      renderFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = undefined
      }
    }
  }, [render, isClient, animationSettings.isAnimating])

  // Export as SVG
  const exportSVG = useCallback(() => {
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
  }, [nodes, nodeSize])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setLayers([3, 4, 3, 2])
    setAnimationSettings({
      isAnimating: true,
      pulseSpeed: 2,
      learningSpeed: 1,
      time: 0
    })
    setShowWeights(false)
    setShowActivations(false)
    setShowPulses(true)
    setShowErrors(true)
    setNodeSize(16)
    setConnectionOpacity(0.7)
    setLearningRate(0.1)
    setIsTraining(false)
    setCurrentEpoch(0)
    setCurrentTrainingIndex(0)
    setTrainingError(0)
    setIsLearning(false)
  }, [])

  // Test network
  const testNetwork = useCallback(() => {
    const testInputs = [0.5, 0.3, 0.8]
    const outputs = forwardPropagate(testInputs)
  }, [forwardPropagate])

  if (!isClient) {
    return <FullScreenLoader text="Preparing..." />
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
          Training: {isTraining ? 'On' : 'Off'} | 
          Error: {trainingError.toFixed(4)} | 
          Example: {currentTrainingIndex + 1}/{trainingData.length}
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