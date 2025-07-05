import { VisualizationSuggestion } from '../types'
import { 
  GridSettings, 
  TurbulenceSettings, 
  CircularFieldSettings, 
  TopographyDisplaySettings,
  AnimationSettings,
  FlowFieldAnimationSettings,
  TurbulenceAnimationSettings,
  CircularFieldAnimationSettings,
  TopographyAnimationSettings
} from '../types'

export interface GeneratedVisualization {
  type: string
  settings: any
  animationSettings: any
  customParameters?: Record<string, any>
  rendererConfig?: {
    renderer: string
    parameters: Record<string, any>
  }
  metadata: {
    sourceSuggestionId: string
    generatedAt: Date
    version: string
  }
}

export class VisualizationGenerator {
  
  /**
   * Generate a visualization configuration from a suggestion
   */
  static generateFromSuggestion(suggestion: VisualizationSuggestion): GeneratedVisualization | null {
    if (!suggestion.implementation) {
      return null
    }

    const { implementation } = suggestion
    
    switch (implementation.type) {
      case 'grid-field':
        return this.generateGridField(implementation)
      case 'flow-field':
        return this.generateFlowField(implementation)
      case 'turbulence':
        return this.generateTurbulence(implementation)
      case 'circular-field':
        return this.generateCircularField(implementation)
      case 'topography':
        return this.generateTopography(implementation)
      case 'custom':
        return this.generateCustom(implementation)
      default:
        return null
    }
  }

  /**
   * Generate grid field visualization
   */
  private static generateGridField(implementation: any): GeneratedVisualization {
    const baseSettings: GridSettings = {
      spacing: 50,
      lineLength: 100,
      type: 'rectangular',
      curveStiffness: 0.5,
      showPoles: true,
      ...implementation.baseSettings
    }

    const animationSettings: AnimationSettings = {
      isAnimating: false,
      time: 0,
      windStrength: 0.5,
      windSpeed: 1.0,
      ...implementation.animationSettings
    }

    return {
      type: 'grid-field',
      settings: baseSettings,
      animationSettings,
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Generate flow field visualization
   */
  private static generateFlowField(implementation: any): GeneratedVisualization {
    const baseSettings = {
      particleCount: 100,
      particleSpeed: 2.0,
      particleLife: 100,
      flowIntensity: 1.0,
      ...implementation.baseSettings
    }

    const animationSettings: FlowFieldAnimationSettings = {
      isAnimating: false,
      time: 0,
      particleSpeed: 2.0,
      particleLife: 100,
      flowIntensity: 1.0,
      ...implementation.animationSettings
    }

    return {
      type: 'flow-field',
      settings: baseSettings,
      animationSettings,
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Generate turbulence visualization
   */
  private static generateTurbulence(implementation: any): GeneratedVisualization {
    const baseSettings: TurbulenceSettings = {
      lineCount: 50,
      lineLength: 200,
      showSources: true,
      streamlineMode: false,
      flowingMode: false,
      streamlineSteps: 100,
      streamlineStepSize: 2,
      sources: [],
      ...implementation.baseSettings
    }

    const animationSettings: TurbulenceAnimationSettings = {
      isAnimating: false,
      time: 0,
      speed: 1.0,
      intensity: 1.0,
      ...implementation.animationSettings
    }

    return {
      type: 'turbulence',
      settings: baseSettings,
      animationSettings,
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Generate circular field visualization
   */
  private static generateCircularField(implementation: any): GeneratedVisualization {
    const baseSettings: CircularFieldSettings = {
      lineCount: 36,
      lineSpacing: 10,
      lineWeight: 1,
      opacity: 0.8,
      showPoles: true,
      animationSpeed: 1.0,
      ...implementation.baseSettings
    }

    const animationSettings: CircularFieldAnimationSettings = {
      isAnimating: false,
      rotationSpeed: 1.0,
      pulseEffect: false,
      time: 0,
      ...implementation.animationSettings
    }

    return {
      type: 'circular-field',
      settings: baseSettings,
      animationSettings,
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Generate topography visualization
   */
  private static generateTopography(implementation: any): GeneratedVisualization {
    const baseSettings: TopographyDisplaySettings = {
      showElevationPoints: true,
      showContourLines: true,
      showElevationLabels: true,
      showGradientField: false,
      lineWeight: 1,
      majorContourWeight: 2,
      majorContourInterval: 100,
      ...implementation.baseSettings
    }

    const animationSettings: TopographyAnimationSettings = {
      isAnimating: false,
      time: 0,
      windSpeed: 1.0,
      windDirection: 0,
      contourPulse: false,
      ...implementation.animationSettings
    }

    return {
      type: 'topography',
      settings: baseSettings,
      animationSettings,
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Generate custom visualization
   */
  private static generateCustom(implementation: any): GeneratedVisualization {
    return {
      type: 'custom',
      settings: implementation.baseSettings || {},
      animationSettings: implementation.animationSettings || {},
      customParameters: implementation.customParameters,
      rendererConfig: implementation.rendererConfig,
      metadata: {
        sourceSuggestionId: implementation.sourceId || 'unknown',
        generatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  /**
   * Create a template suggestion with implementation details
   */
  static createTemplateSuggestion(
    title: string,
    description: string,
    type: 'grid-field' | 'flow-field' | 'turbulence' | 'circular-field' | 'topography' | 'custom',
    baseSettings?: any,
    animationSettings?: any,
    customParameters?: Record<string, any>
  ): Partial<VisualizationSuggestion> {
    return {
      title,
      description,
      category: this.getCategoryForType(type),
      complexity: this.getComplexityForType(type),
      difficulty: 'intermediate',
      estimatedDevTime: this.getEstimatedDevTime(type),
      tags: this.getDefaultTags(type),
      implementation: {
        type,
        baseSettings,
        animationSettings,
        customParameters,
        rendererConfig: {
          renderer: type,
          parameters: {}
        }
      }
    }
  }

  /**
   * Get category for visualization type
   */
  private static getCategoryForType(type: string): string {
    const categoryMap: Record<string, string> = {
      'grid-field': 'Geometric',
      'flow-field': 'Physics',
      'turbulence': 'Physics',
      'circular-field': 'Geometric',
      'topography': 'Scientific',
      'custom': 'Abstract'
    }
    return categoryMap[type] || 'Abstract'
  }

  /**
   * Get complexity for visualization type
   */
  private static getComplexityForType(type: string): 'low' | 'medium' | 'high' {
    const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'grid-field': 'low',
      'circular-field': 'low',
      'flow-field': 'medium',
      'topography': 'medium',
      'turbulence': 'high',
      'custom': 'high'
    }
    return complexityMap[type] || 'medium'
  }

  /**
   * Get estimated development time
   */
  private static getEstimatedDevTime(type: string): number {
    const timeMap: Record<string, number> = {
      'grid-field': 4,
      'circular-field': 4,
      'flow-field': 8,
      'topography': 12,
      'turbulence': 16,
      'custom': 20
    }
    return timeMap[type] || 8
  }

  /**
   * Get default tags for visualization type
   */
  private static getDefaultTags(type: string): string[] {
    const tagMap: Record<string, string[]> = {
      'grid-field': ['grid', 'geometric', 'patterns'],
      'circular-field': ['circular', 'radial', 'patterns'],
      'flow-field': ['flow', 'particles', 'physics'],
      'topography': ['terrain', 'elevation', 'contours'],
      'turbulence': ['turbulence', 'fluid-dynamics', 'complex'],
      'custom': ['custom', 'experimental']
    }
    return tagMap[type] || ['custom']
  }

  /**
   * Validate a generated visualization
   */
  static validateGeneratedVisualization(visualization: GeneratedVisualization): boolean {
    if (!visualization.type || !visualization.settings || !visualization.animationSettings) {
      return false
    }

    // Add type-specific validation here
    switch (visualization.type) {
      case 'grid-field':
        return this.validateGridField(visualization.settings)
      case 'flow-field':
        return this.validateFlowField(visualization.settings)
      case 'turbulence':
        return this.validateTurbulence(visualization.settings)
      case 'circular-field':
        return this.validateCircularField(visualization.settings)
      case 'topography':
        return this.validateTopography(visualization.settings)
      case 'custom':
        return true // Custom visualizations are always valid
      default:
        return false
    }
  }

  private static validateGridField(settings: any): boolean {
    return settings.spacing > 0 && settings.lineLength > 0
  }

  private static validateFlowField(settings: any): boolean {
    return settings.particleCount > 0 && settings.particleSpeed > 0
  }

  private static validateTurbulence(settings: any): boolean {
    return settings.lineCount > 0 && settings.lineLength > 0
  }

  private static validateCircularField(settings: any): boolean {
    return settings.lineCount > 0 && settings.lineSpacing > 0
  }

  private static validateTopography(settings: any): boolean {
    return settings.majorContourInterval > 0
  }

  /**
   * Export visualization configuration
   */
  static exportConfiguration(visualization: GeneratedVisualization): string {
    return JSON.stringify(visualization, null, 2)
  }

  /**
   * Import visualization configuration
   */
  static importConfiguration(jsonData: string): GeneratedVisualization {
    const parsed = JSON.parse(jsonData)
    
    // Validate the imported configuration
    if (!this.validateGeneratedVisualization(parsed)) {
      throw new Error('Invalid visualization configuration')
    }
    
    return parsed
  }
} 