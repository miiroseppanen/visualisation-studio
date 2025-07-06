import { VisualizationSuggestion } from '../types'

export const sampleSuggestions: Omit<VisualizationSuggestion, 'id' | 'timestamp' | 'lastModified' | 'version'>[] = [
  {
    title: 'Dynamic Product Packaging Visualization',
    description: 'Interactive particle swarm simulation showing product packaging design with dynamic obstacles representing packaging constraints. Perfect for visualizing how products fit into different packaging solutions.',
    author: 'Packaging Designer',
    upvotes: 25,
    downvotes: 2,
    status: 'approved',
    category: 'Packaging',
    complexity: 'new-visual',
    difficulty: 'advanced',
    estimatedDevTime: 12,
    tags: ['packaging', 'product-design', 'optimization', 'constraints', 'visualization'],
    views: 156,
    favorites: 18,
    comments: [],
    createdBy: 'packaging-designer-001',
    implementation: {
      type: 'particle-swarm',
      baseSettings: {
        particleCount: 150,
        maxSpeed: 3.0,
        neighborRadius: 50,
        separationWeight: 1.5,
        alignmentWeight: 1.0,
        cohesionWeight: 1.2,
        obstacleAvoidanceWeight: 2.0
      },
      animationSettings: {
        isAnimating: true,
        speed: 1.2
      },
      customParameters: {
        obstacleCount: 8,
        obstacleSize: 30,
        dynamicObstacles: true,
        obstacleMovementSpeed: 0.5
      }
    }
  },
  {
    title: 'Seasonal Brand Identity Animation',
    description: 'Dynamic fractal tree visualization that adapts brand colors and patterns based on seasons. Perfect for seasonal marketing campaigns, brand evolution, and visual identity systems.',
    author: 'Brand Strategist',
    upvotes: 18,
    downvotes: 1,
    status: 'pending',
    category: 'Branding',
    complexity: 'improvement',
    difficulty: 'intermediate',
    estimatedDevTime: 8,
    tags: ['branding', 'seasonal', 'marketing', 'identity', 'evolution'],
    views: 89,
    favorites: 12,
    comments: [],
    createdBy: 'brand-strategist-002',
    implementation: {
      type: 'fractal-tree',
      baseSettings: {
        branchAngle: 45,
        lengthRatio: 0.7,
        recursionDepth: 8,
        initialLength: 100
      },
      animationSettings: {
        isAnimating: true,
        speed: 0.8,
        growthSpeed: 1.5
      },
      customParameters: {
        season: 'spring',
        leafDensity: 0.8,
        colorPalette: 'spring',
        windEffect: true
      }
    }
  },
  {
    title: 'Customer Journey Flow Analysis',
    description: 'Interactive neural network visualization showing customer touchpoints and decision paths. Perfect for UX research, customer experience mapping, and conversion optimization.',
    author: 'UX Researcher',
    upvotes: 32,
    downvotes: 0,
    status: 'implemented',
    category: 'Customer Experience',
    complexity: 'high',
    difficulty: 'advanced',
    estimatedDevTime: 15,
    tags: ['ux', 'customer-journey', 'conversion', 'touchpoints', 'analytics'],
    views: 234,
    favorites: 28,
    comments: [],
    createdBy: 'ux-researcher-003',
    implementation: {
      type: 'neural-network',
      baseSettings: {
        layers: [4, 8, 6, 2],
        learningRate: 0.01,
        activationFunction: 'sigmoid'
      },
      animationSettings: {
        isAnimating: true,
        pulseSpeed: 1.0,
        learningSpeed: 0.5
      },
      customParameters: {
        showWeights: true,
        showGradients: true,
        trainingData: 'xor',
        epochs: 1000
      }
    }
  },
  {
    title: 'Event Sound Visualization System',
    description: 'Advanced wave interference simulation for event sound design and audio branding. Shows how different audio elements interact at events, parties, and brand activations.',
    author: 'Event Producer',
    upvotes: 22,
    downvotes: 3,
    status: 'approved',
    category: 'Events',
    complexity: 'medium',
    difficulty: 'intermediate',
    estimatedDevTime: 10,
    tags: ['events', 'audio', 'sound-design', 'brand-activation', 'parties'],
    views: 167,
    favorites: 15,
    comments: [],
    implementation: {
      type: 'wave-interference',
      baseSettings: {
        waveCount: 4,
        amplitude: 50,
        wavelength: 100
      },
      animationSettings: {
        isAnimating: true,
        speed: 1.0,
        waveSpeed: 2.0
      },
      customParameters: {
        showIndividualWaves: true,
        showResultant: true,
        frequencyRange: [0.5, 2.0],
        phaseControl: true
      }
    }
  },
  {
    title: 'Social Media Content Patterns',
    description: 'Cellular automata system for analyzing social media content patterns and viral spread. Perfect for social media strategy, content planning, and engagement optimization.',
    author: 'Social Media Manager',
    upvotes: 19,
    downvotes: 2,
    status: 'pending',
    category: 'Social Media',
    complexity: 'medium',
    difficulty: 'intermediate',
    estimatedDevTime: 9,
    tags: ['social-media', 'content', 'viral', 'engagement', 'strategy'],
    views: 134,
    favorites: 11,
    comments: [],
    implementation: {
      type: 'cellular-automata',
      baseSettings: {
        gridSize: 100,
        cellSize: 5,
        ruleSet: 'game-of-life'
      },
      animationSettings: {
        isAnimating: true,
        speed: 0.5,
        cellSize: 5
      },
      customParameters: {
        customRules: false,
        neighborhoodType: 'moore',
        states: 2,
        wrapEdges: true
      }
    }
  },
  {
    title: 'Audio Brand Identity Analyzer',
    description: 'Real-time sound wave analysis for audio branding and sonic identity development. Shows frequency spectrum, harmonic relationships, and brand sound characteristics.',
    author: 'Audio Branding Specialist',
    upvotes: 16,
    downvotes: 1,
    status: 'approved',
    category: 'Audio Branding',
    complexity: 'high',
    difficulty: 'advanced',
    estimatedDevTime: 14,
    tags: ['audio-branding', 'sonic-identity', 'frequency', 'harmonics', 'brand-sound'],
    views: 98,
    favorites: 9,
    comments: [],
    implementation: {
      type: 'sound-wave',
      baseSettings: {
        frequency: 440,
        amplitude: 1.0,
        waveform: 'sine'
      },
      animationSettings: {
        isAnimating: true,
        frequency: 440,
        amplitude: 1.0,
        waveSpeed: 1.0
      },
      customParameters: {
        showSpectrum: true,
        showHarmonics: true,
        audioInput: true,
        fftSize: 2048
      }
    }
  },
  {
    title: 'Retail Store Layout Optimization',
    description: 'Magnetic field visualization for retail store layout optimization and customer flow analysis. Shows how different store elements attract and guide customer movement.',
    author: 'Retail Designer',
    upvotes: 14,
    downvotes: 2,
    status: 'pending',
    category: 'Retail',
    complexity: 'medium',
    difficulty: 'intermediate',
    estimatedDevTime: 7,
    tags: ['retail', 'store-layout', 'customer-flow', 'optimization', 'design'],
    views: 76,
    favorites: 7,
    comments: [],
    implementation: {
      type: 'circular-field',
      baseSettings: {
        lineCount: 200,
        lineSpacing: 10,
        lineWeight: 1,
        opacity: 0.8,
        showPoles: true
      },
      animationSettings: {
        isAnimating: true,
        rotationSpeed: 0.5,
        pulseEffect: true,
        time: 0
      },
      customParameters: {
        poleCount: 4,
        poleStrengths: [1.0, -0.8, 0.6, -0.4],
        showFieldLines: true,
        showEquipotential: false
      }
    }
  },
  {
    title: 'Geographic Market Analysis',
    description: 'Topographic map visualization for geographic market analysis and territory planning. Shows market density, customer distribution, and sales territory optimization.',
    author: 'Market Analyst',
    upvotes: 12,
    downvotes: 1,
    status: 'implemented',
    category: 'Market Analysis',
    complexity: 'medium',
    difficulty: 'intermediate',
    estimatedDevTime: 11,
    tags: ['market-analysis', 'geographic', 'territory', 'sales', 'distribution'],
    views: 112,
    favorites: 8,
    comments: [],
    implementation: {
      type: 'topography',
      baseSettings: {
        showElevationPoints: true,
        showContourLines: true,
        showElevationLabels: true,
        showGradientField: true,
        lineWeight: 1,
        majorContourWeight: 2,
        majorContourInterval: 100
      },
      animationSettings: {
        isAnimating: true,
        windSpeed: 1.0,
        windDirection: 45,
        time: 0
      },
      customParameters: {
        terrainType: 'mountainous',
        noiseScale: 0.02,
        elevationRange: [0, 1000],
        erosionFactor: 0.3
      }
    }
  },
  {
    title: 'Supply Chain Flow Visualization',
    description: 'Turbulent flow simulation for supply chain optimization and logistics planning. Shows product flow, bottlenecks, and distribution network efficiency.',
    author: 'Supply Chain Manager',
    upvotes: 28,
    downvotes: 1,
    status: 'approved',
    category: 'Supply Chain',
    complexity: 'high',
    difficulty: 'advanced',
    estimatedDevTime: 16,
    tags: ['supply-chain', 'logistics', 'flow', 'optimization', 'distribution'],
    views: 189,
    favorites: 22,
    comments: [],
    implementation: {
      type: 'turbulence',
      baseSettings: {
        lineCount: 300,
        lineLength: 80,
        showSources: true,
        streamlineMode: true,
        flowingMode: true,
        streamlineSteps: 50,
        streamlineStepSize: 2
      },
      animationSettings: {
        isAnimating: true,
        speed: 1.5,
        intensity: 1.0
      },
      customParameters: {
        vortexDetection: true,
        pressureGradient: true,
        reynoldsNumber: 1000,
        viscosity: 0.001
      }
    }
  },
  {
    title: 'Website Navigation Pattern Analysis',
    description: 'Interactive grid field visualization for website navigation analysis and user flow optimization. Shows how users navigate through different sections and content areas.',
    author: 'Web Designer',
    upvotes: 11,
    downvotes: 2,
    status: 'pending',
    category: 'Web Design',
    complexity: 'low',
    difficulty: 'beginner',
    estimatedDevTime: 5,
    tags: ['web-design', 'navigation', 'user-flow', 'ux', 'patterns'],
    views: 67,
    favorites: 5,
    comments: [],
    implementation: {
      type: 'grid-field',
      baseSettings: {
        spacing: 30,
        lineLength: 60,
        type: 'rectangular',
        curveStiffness: 0.5,
        showPoles: false
      },
      animationSettings: {
        isAnimating: true,
        windStrength: 1.0,
        windSpeed: 1.0
      },
      customParameters: {
        patternType: 'spiral',
        dynamicSpacing: true,
        colorGradient: true,
        interactivePoles: true
      }
    }
  }
]

export function generateSampleSuggestions(): VisualizationSuggestion[] {
  return sampleSuggestions.map((suggestion, index) => ({
    ...suggestion,
    id: `sample-${index + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    lastModified: new Date(),
    version: '1.0.0'
  }))
} 