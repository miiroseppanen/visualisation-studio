import React from 'react'

// Grid Field Preview
export const GridFieldPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="grid grid-cols-4 gap-1 w-16 h-16">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="bg-black dark:bg-white rounded-sm"
          style={{
            opacity: Math.random() * 0.8 + 0.2,
            transform: `rotate(${Math.random() * 90}deg)`
          }}
        />
      ))}
    </div>
  </div>
)

// Flow Field Preview
export const FlowFieldPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-8 bg-black dark:bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-12px)`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  </div>
)

// Turbulence Preview
export const TurbulencePreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-6 bg-black dark:bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${8 + Math.random() * 8}px)`,
            opacity: 0.4 + Math.random() * 0.4
          }}
        />
      ))}
    </div>
  </div>
)

// Topography Preview
export const TopographyPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="absolute border border-black dark:border-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: `${20 + i * 8}px`,
            height: `${20 + i * 8}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.3 + i * 0.15
          }}
        />
      ))}
    </div>
  </div>
)

// Circular Field Preview
export const CircularFieldPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      <div className="absolute w-4 h-4 bg-black dark:bg-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute border border-black dark:border-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: `${12 + i * 6}px`,
            height: `${12 + i * 6}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.2 + i * 0.1
          }}
        />
      ))}
    </div>
  </div>
)

// Wave Interference Preview
export const WaveInterferencePreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="absolute border border-black dark:border-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: `${16 + i * 12}px`,
            height: `${16 + i * 12}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.3 + i * 0.2
          }}
        />
      ))}
    </div>
  </div>
)

// Wave Interference 2 Preview
export const WaveInterference2Preview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="absolute border border-black dark:border-white"
          style={{
            left: '50%',
            top: '50%',
            width: `${12 + i * 8}px`,
            height: `${12 + i * 8}px`,
            transform: 'translate(-50%, -50%) rotate(45deg)',
            opacity: 0.2 + i * 0.15
          }}
        />
      ))}
    </div>
  </div>
)

// Particle Swarm Preview
export const ParticleSwarmPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-black dark:bg-white rounded-full"
          style={{
            left: `${20 + Math.sin(i * 0.8) * 15}px`,
            top: `${20 + Math.cos(i * 0.8) * 15}px`,
            opacity: 0.6 + Math.random() * 0.4
          }}
        />
      ))}
    </div>
  </div>
)

// Neural Network Preview
export const NeuralNetworkPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      {/* Nodes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-black dark:bg-white rounded-full"
          style={{
            left: `${8 + (i % 3) * 12}px`,
            top: `${8 + Math.floor(i / 3) * 12}px`,
            opacity: 0.8
          }}
        />
      ))}
      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        <line x1="14" y1="8" x2="26" y2="8" stroke="black" strokeWidth="1" className="dark:stroke-white" />
        <line x1="14" y1="20" x2="26" y2="20" stroke="black" strokeWidth="1" className="dark:stroke-white" />
        <line x1="8" y1="14" x2="20" y2="14" stroke="black" strokeWidth="1" className="dark:stroke-white" />
        <line x1="20" y1="14" x2="32" y2="14" stroke="black" strokeWidth="1" className="dark:stroke-white" />
      </svg>
    </div>
  </div>
)

// Cellular Automata Preview
export const CellularAutomataPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="grid grid-cols-6 gap-0.5 w-16 h-16">
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          className={`w-full h-full rounded-sm ${
            Math.random() > 0.6 ? 'bg-black dark:bg-white' : 'bg-transparent'
          }`}
          style={{ opacity: 0.8 }}
        />
      ))}
    </div>
  </div>
)

// Sound Wave Preview
export const SoundWavePreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 bg-black dark:bg-white rounded-full"
          style={{
            left: `${i * 2.5}px`,
            top: '50%',
            height: `${4 + Math.sin(i * 0.8) * 8}px`,
            transform: 'translateY(-50%)',
            opacity: 0.6
          }}
        />
      ))}
    </div>
  </div>
)

// Preview component mapping
export const previewComponents = {
  'grid-field': GridFieldPreview,
  'flow-field': FlowFieldPreview,
  'turbulence': TurbulencePreview,
  'topography': TopographyPreview,
  'circular-field': CircularFieldPreview,
  'wave-interference': WaveInterferencePreview,
  'wave-interference-2': WaveInterference2Preview,
  'particle-swarm': ParticleSwarmPreview,
  'neural-network': NeuralNetworkPreview,
  'cellular-automata': CellularAutomataPreview,
  'sound-wave': SoundWavePreview,
}

export const getPreviewComponent = (id: string) => {
  return previewComponents[id as keyof typeof previewComponents]
} 