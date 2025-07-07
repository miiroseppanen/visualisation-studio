import { PrismaClient, Suggestion, Comment, Tag, Implementation, Dependency, UserInteraction, Statistics, SuggestionStatus, Complexity, Difficulty, ImplementationType, InteractionType } from '@prisma/client'
import { VisualizationSuggestion, SuggestionFilters, SuggestionStats } from '../types'

// Global Prisma client instance with connection pooling
let globalPrisma: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }
  return globalPrisma
}

// Cache for suggestions to reduce database calls
const suggestionsCache = new Map<string, VisualizationSuggestion>()
const cacheTimeout = 5 * 60 * 1000 // 5 minutes
const cacheTimestamps = new Map<string, number>()

function isCacheValid(key: string): boolean {
  const timestamp = cacheTimestamps.get(key)
  return timestamp ? Date.now() - timestamp < cacheTimeout : false
}

function clearExpiredCache(): void {
  const now = Date.now()
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp >= cacheTimeout) {
      suggestionsCache.delete(key)
      cacheTimestamps.delete(key)
    }
  }
}

// Prisma database provider for suggestions
export class PrismaProvider {
  private prisma: PrismaClient

  constructor() {
    this.prisma = getPrismaClient()
  }

  // Mapping functions to convert frontend values to database enum values
  private mapStatus(status: string): 'PENDING' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED' {
    switch (status) {
      case 'pending': return 'PENDING'
      case 'approved': return 'APPROVED'
      case 'implemented': return 'IMPLEMENTED'
      case 'rejected': return 'REJECTED'
      default: return 'PENDING'
    }
  }

  private mapComplexity(complexity: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (complexity) {
      case 'low': return 'LOW'
      case 'medium': return 'MEDIUM'
      case 'high': return 'HIGH'
      default: return 'MEDIUM'
    }
  }

  private mapDifficulty(difficulty: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    switch (difficulty) {
      case 'beginner': return 'BEGINNER'
      case 'intermediate': return 'INTERMEDIATE'
      case 'advanced': return 'ADVANCED'
      default: return 'INTERMEDIATE'
    }
  }

  // Initialize database connection
  async init(): Promise<void> {
    try {
      await this.prisma.$connect()
    } catch (error) {
      console.error('Failed to connect to database:', error)
      throw error
    }
  }

  // Close database connection
  async close(): Promise<void> {
    await this.prisma.$disconnect()
  }

  // Save suggestion
  async save(suggestion: VisualizationSuggestion): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Save main suggestion
        const suggestionData = {
          id: suggestion.id,
          title: suggestion.title,
          description: suggestion.description,
          author: suggestion.author,
          timestamp: suggestion.timestamp,
          lastModified: suggestion.lastModified,
          upvotes: suggestion.upvotes,
          downvotes: suggestion.downvotes,
          status: this.mapStatus(suggestion.status),
          category: suggestion.category,
          complexity: this.mapComplexity(suggestion.complexity),
          difficulty: this.mapDifficulty(suggestion.difficulty),
          estimatedDevTime: suggestion.estimatedDevTime,
          version: suggestion.version,
          createdBy: suggestion.createdBy,
          views: suggestion.views,
          favorites: suggestion.favorites
        }

        await tx.suggestion.upsert({
          where: { id: suggestion.id },
          update: suggestionData,
          create: suggestionData
        })

        // Save tags
        if (suggestion.tags && suggestion.tags.length > 0) {
          // Clear existing tags for this suggestion
          await tx.suggestionTag.deleteMany({
            where: { suggestionId: suggestion.id }
          })

          // Add new tags
          for (const tagName of suggestion.tags) {
            // Find or create tag
            let tag = await tx.tag.findUnique({
              where: { name: tagName }
            })

            if (!tag) {
              tag = await tx.tag.create({
                data: { name: tagName }
              })
            }

            // Link tag to suggestion
            await tx.suggestionTag.create({
              data: {
                suggestionId: suggestion.id,
                tagId: tag.id
              }
            })
          }
        }

        // Save implementation details
        if (suggestion.implementation) {
          await tx.implementation.upsert({
            where: { suggestionId: suggestion.id },
            update: {
              type: suggestion.implementation.type as ImplementationType,
              baseSettings: suggestion.implementation.baseSettings,
              animationSettings: suggestion.implementation.animationSettings,
              customParameters: suggestion.implementation.customParameters,
              rendererConfig: suggestion.implementation.rendererConfig
            },
            create: {
              suggestionId: suggestion.id,
              type: suggestion.implementation.type as ImplementationType,
              baseSettings: suggestion.implementation.baseSettings,
              animationSettings: suggestion.implementation.animationSettings,
              customParameters: suggestion.implementation.customParameters,
              rendererConfig: suggestion.implementation.rendererConfig
            }
          })
        }

        // Save dependencies
        if (suggestion.dependencies && suggestion.dependencies.length > 0) {
          // Clear existing dependencies
          await tx.dependency.deleteMany({
            where: { suggestionId: suggestion.id }
          })

          // Add new dependencies
          for (const dep of suggestion.dependencies) {
            await tx.dependency.create({
              data: {
                suggestionId: suggestion.id,
                dependencyName: dep,
                dependencyVersion: undefined
              }
            })
          }
        }
      })

      // Update cache
      suggestionsCache.set(suggestion.id, suggestion)
      cacheTimestamps.set(suggestion.id, Date.now())

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to save suggestion:', error)
      throw error
    }
  }

  // Get suggestion by ID with caching
  async get(id: string): Promise<VisualizationSuggestion | null> {
    try {
      // Check cache first
      if (suggestionsCache.has(id) && isCacheValid(id)) {
        return suggestionsCache.get(id)!
      }

      const suggestion = await this.prisma.suggestion.findUnique({
        where: { id },
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          comments: true,
          implementation: true,
          dependencies: true
        }
      })

      if (!suggestion) return null

      const result = {
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        author: suggestion.author,
        timestamp: suggestion.timestamp,
        lastModified: suggestion.lastModified,
        upvotes: suggestion.upvotes,
        downvotes: suggestion.downvotes,
        status: suggestion.status,
        category: suggestion.category,
        complexity: suggestion.complexity,
        difficulty: suggestion.difficulty,
        estimatedDevTime: suggestion.estimatedDevTime,
        version: suggestion.version,
        createdBy: suggestion.createdBy,
        views: suggestion.views,
        favorites: suggestion.favorites,
        tags: suggestion.tags.map(st => st.tag.name),
        comments: suggestion.comments.map(c => ({
          id: c.id,
          suggestionId: c.suggestionId,
          author: c.author,
          content: c.content,
          timestamp: c.timestamp,
          upvotes: c.upvotes,
          downvotes: c.downvotes
        })),
        implementation: suggestion.implementation ? {
          type: suggestion.implementation.type,
          baseSettings: suggestion.implementation.baseSettings,
          animationSettings: suggestion.implementation.animationSettings,
          customParameters: suggestion.implementation.customParameters,
          rendererConfig: suggestion.implementation.rendererConfig
        } : undefined,
        dependencies: suggestion.dependencies.map(d => d.dependencyName)
      }

      // Cache the result
      suggestionsCache.set(id, result)
      cacheTimestamps.set(id, Date.now())

      return result
    } catch (error) {
      console.error('Failed to get suggestion:', error)
      throw error
    }
  }

  // Get all suggestions with filters and caching
  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    try {
      // Clear expired cache entries
      clearExpiredCache()

      const where: any = {}

      if (filters?.status) {
        where.status = filters.status as SuggestionStatus
      }

      if (filters?.category) {
        where.category = filters.category
      }

      const suggestions = await this.prisma.suggestion.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          comments: true,
          implementation: true,
          dependencies: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      const result = suggestions.map(suggestion => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        author: suggestion.author,
        timestamp: suggestion.timestamp,
        lastModified: suggestion.lastModified,
        upvotes: suggestion.upvotes,
        downvotes: suggestion.downvotes,
        status: suggestion.status,
        category: suggestion.category,
        complexity: suggestion.complexity,
        difficulty: suggestion.difficulty,
        estimatedDevTime: suggestion.estimatedDevTime,
        version: suggestion.version,
        createdBy: suggestion.createdBy,
        views: suggestion.views,
        favorites: suggestion.favorites,
        tags: suggestion.tags.map(st => st.tag.name),
        comments: suggestion.comments.map(c => ({
          id: c.id,
          suggestionId: c.suggestionId,
          author: c.author,
          content: c.content,
          timestamp: c.timestamp,
          upvotes: c.upvotes,
          downvotes: c.downvotes
        })),
        implementation: suggestion.implementation ? {
          type: suggestion.implementation.type,
          baseSettings: suggestion.implementation.baseSettings,
          animationSettings: suggestion.implementation.animationSettings,
          customParameters: suggestion.implementation.customParameters,
          rendererConfig: suggestion.implementation.rendererConfig
        } : undefined,
        dependencies: suggestion.dependencies.map(d => d.dependencyName)
      }))

      // Cache individual suggestions
      result.forEach(suggestion => {
        suggestionsCache.set(suggestion.id, suggestion)
        cacheTimestamps.set(suggestion.id, Date.now())
      })

      return result
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      throw error
    }
  }

  // Update suggestion
  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    try {
      const updateData: any = {}
      
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.upvotes !== undefined) updateData.upvotes = updates.upvotes
      if (updates.downvotes !== undefined) updateData.downvotes = updates.downvotes
      if (updates.status !== undefined) updateData.status = this.mapStatus(updates.status)
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.complexity !== undefined) updateData.complexity = this.mapComplexity(updates.complexity)
      if (updates.difficulty !== undefined) updateData.difficulty = this.mapDifficulty(updates.difficulty)
      if (updates.estimatedDevTime !== undefined) updateData.estimatedDevTime = updates.estimatedDevTime
      if (updates.views !== undefined) updateData.views = updates.views
      if (updates.favorites !== undefined) updateData.favorites = updates.favorites
      
      updateData.lastModified = new Date()

      await this.prisma.suggestion.update({
        where: { id },
        data: updateData
      })

      // Invalidate cache for this suggestion
      suggestionsCache.delete(id)
      cacheTimestamps.delete(id)

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to update suggestion:', error)
      throw error
    }
  }

  // Delete suggestion
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.suggestion.delete({
        where: { id }
      })

      // Remove from cache
      suggestionsCache.delete(id)
      cacheTimestamps.delete(id)

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to delete suggestion:', error)
      throw error
    }
  }

  // Get statistics
  async getStats(): Promise<SuggestionStats> {
    try {
      const [total, pending, approved, implemented, rejected] = await Promise.all([
        this.prisma.suggestion.count(),
        this.prisma.suggestion.count({ where: { status: 'PENDING' } }),
        this.prisma.suggestion.count({ where: { status: 'APPROVED' } }),
        this.prisma.suggestion.count({ where: { status: 'IMPLEMENTED' } }),
        this.prisma.suggestion.count({ where: { status: 'REJECTED' } })
      ])

      const categoryStats = await this.getCategoryStats()
      const complexityStats = await this.getComplexityStats()
      const topRated = await this.getTopRatedSuggestions()
      const mostViewed = await this.getMostViewedSuggestions()
      const recentlyAdded = await this.getRecentlyAddedSuggestions()

      return {
        total,
        pending,
        approved,
        implemented,
        rejected,
        categoryStats,
        complexityStats,
        topRated,
        mostViewed,
        recentlyAdded
      }
    } catch (error) {
      console.error('Failed to get statistics:', error)
      throw error
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.suggestionTag.deleteMany(),
        this.prisma.dependency.deleteMany(),
        this.prisma.implementation.deleteMany(),
        this.prisma.comment.deleteMany(),
        this.prisma.suggestion.deleteMany(),
        this.prisma.tag.deleteMany(),
        this.prisma.statistics.deleteMany()
      ])

      // Clear cache
      suggestionsCache.clear()
      cacheTimestamps.clear()
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw error
    }
  }

  // Update statistics
  private async updateStatistics(): Promise<SuggestionStats> {
    return this.getStats()
  }

  // Get category statistics
  private async getCategoryStats(): Promise<Record<string, number>> {
    const stats = await this.prisma.suggestion.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })

    return stats.reduce((acc, stat) => {
      acc[stat.category] = stat._count.category
      return acc
    }, {} as Record<string, number>)
  }

  // Get complexity statistics
  private async getComplexityStats(): Promise<Record<string, number>> {
    const stats = await this.prisma.suggestion.groupBy({
      by: ['complexity'],
      _count: {
        complexity: true
      }
    })

    return stats.reduce((acc, stat) => {
      acc[stat.complexity] = stat._count.complexity
      return acc
    }, {} as Record<string, number>)
  }

  // Get top rated suggestions
  private async getTopRatedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
      take: 5,
      orderBy: [
        { upvotes: 'desc' },
        { timestamp: 'desc' }
      ],
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        comments: true,
        implementation: true,
        dependencies: true
      }
    })

    return suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      author: suggestion.author,
      timestamp: suggestion.timestamp,
      lastModified: suggestion.lastModified,
      upvotes: suggestion.upvotes,
      downvotes: suggestion.downvotes,
      status: suggestion.status,
      category: suggestion.category,
      complexity: suggestion.complexity,
      difficulty: suggestion.difficulty,
      estimatedDevTime: suggestion.estimatedDevTime,
      version: suggestion.version,
      createdBy: suggestion.createdBy,
      views: suggestion.views,
      favorites: suggestion.favorites,
      tags: suggestion.tags.map(st => st.tag.name),
      comments: suggestion.comments.map(c => ({
        id: c.id,
        suggestionId: c.suggestionId,
        author: c.author,
        content: c.content,
        timestamp: c.timestamp,
        upvotes: c.upvotes,
        downvotes: c.downvotes
      })),
      implementation: suggestion.implementation ? {
        type: suggestion.implementation.type,
        baseSettings: suggestion.implementation.baseSettings,
        animationSettings: suggestion.implementation.animationSettings,
        customParameters: suggestion.implementation.customParameters,
        rendererConfig: suggestion.implementation.rendererConfig
      } : undefined,
      dependencies: suggestion.dependencies.map(d => d.dependencyName)
    }))
  }

  // Get most viewed suggestions
  private async getMostViewedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
      take: 5,
      orderBy: [
        { views: 'desc' },
        { timestamp: 'desc' }
      ],
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        comments: true,
        implementation: true,
        dependencies: true
      }
    })

    return suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      author: suggestion.author,
      timestamp: suggestion.timestamp,
      lastModified: suggestion.lastModified,
      upvotes: suggestion.upvotes,
      downvotes: suggestion.downvotes,
      status: suggestion.status,
      category: suggestion.category,
      complexity: suggestion.complexity,
      difficulty: suggestion.difficulty,
      estimatedDevTime: suggestion.estimatedDevTime,
      version: suggestion.version,
      createdBy: suggestion.createdBy,
      views: suggestion.views,
      favorites: suggestion.favorites,
      tags: suggestion.tags.map(st => st.tag.name),
      comments: suggestion.comments.map(c => ({
        id: c.id,
        suggestionId: c.suggestionId,
        author: c.author,
        content: c.content,
        timestamp: c.timestamp,
        upvotes: c.upvotes,
        downvotes: c.downvotes
      })),
      implementation: suggestion.implementation ? {
        type: suggestion.implementation.type,
        baseSettings: suggestion.implementation.baseSettings,
        animationSettings: suggestion.implementation.animationSettings,
        customParameters: suggestion.implementation.customParameters,
        rendererConfig: suggestion.implementation.rendererConfig
      } : undefined,
      dependencies: suggestion.dependencies.map(d => d.dependencyName)
    }))
  }

  // Get recently added suggestions
  private async getRecentlyAddedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        comments: true,
        implementation: true,
        dependencies: true
      }
    })

    return suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      author: suggestion.author,
      timestamp: suggestion.timestamp,
      lastModified: suggestion.lastModified,
      upvotes: suggestion.upvotes,
      downvotes: suggestion.downvotes,
      status: suggestion.status,
      category: suggestion.category,
      complexity: suggestion.complexity,
      difficulty: suggestion.difficulty,
      estimatedDevTime: suggestion.estimatedDevTime,
      version: suggestion.version,
      createdBy: suggestion.createdBy,
      views: suggestion.views,
      favorites: suggestion.favorites,
      tags: suggestion.tags.map(st => st.tag.name),
      comments: suggestion.comments.map(c => ({
        id: c.id,
        suggestionId: c.suggestionId,
        author: c.author,
        content: c.content,
        timestamp: c.timestamp,
        upvotes: c.upvotes,
        downvotes: c.downvotes
      })),
      implementation: suggestion.implementation ? {
        type: suggestion.implementation.type,
        baseSettings: suggestion.implementation.baseSettings,
        animationSettings: suggestion.implementation.animationSettings,
        customParameters: suggestion.implementation.customParameters,
        rendererConfig: suggestion.implementation.rendererConfig
      } : undefined,
      dependencies: suggestion.dependencies.map(d => d.dependencyName)
    }))
  }
} 