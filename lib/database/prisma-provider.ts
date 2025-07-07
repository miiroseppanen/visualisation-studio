import { PrismaClient, Suggestion, Comment, Tag, Implementation, Dependency, UserInteraction, Statistics, SuggestionStatus, Complexity, Difficulty, ImplementationType, InteractionType } from '@prisma/client'
import { VisualizationSuggestion, SuggestionFilters, SuggestionStats } from '../types'

// Global Prisma client instance
let prisma: PrismaClient | null = null

// Initialize Prisma client
function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
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
      case 'new-visual':
      case 'bug':
      case 'low': return 'LOW'
      case 'improvement':
      case 'enhancement':
      case 'medium': return 'MEDIUM'
      case 'feature':
      case 'high': return 'HIGH'
      default: return 'MEDIUM'
    }
  }

  private mapDifficulty(difficulty: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    switch (difficulty) {
      case 'new-visual':
      case 'bug':
      case 'beginner': return 'BEGINNER'
      case 'improvement':
      case 'enhancement':
      case 'intermediate': return 'INTERMEDIATE'
      case 'feature':
      case 'advanced': return 'ADVANCED'
      default: return 'INTERMEDIATE'
    }
  }

  // Initialize database connection
  async init(): Promise<void> {
    try {
      await this.prisma.$connect()
      console.log('Connected to Neon PostgreSQL database')
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

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to save suggestion:', error)
      throw error
    }
  }

  // Get suggestion by ID
  async get(id: string): Promise<VisualizationSuggestion | null> {
    try {
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

      return {
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
    } catch (error) {
      console.error('Failed to get suggestion:', error)
      throw error
    }
  }

  // Get all suggestions with filters
  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    try {
      const where: any = {}

      if (filters?.status) {
        where.status = filters.status as SuggestionStatus
      }

      if (filters?.category) {
        where.category = filters.category
      }

      if (filters?.complexity) {
        where.complexity = filters.complexity as Complexity
      }

      if (filters?.difficulty) {
        where.difficulty = filters.difficulty as Difficulty
      }

      if (filters?.author) {
        where.author = filters.author
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
        orderBy: filters?.sortBy === 'timestamp' ? { timestamp: 'desc' } :
                filters?.sortBy === 'upvotes' ? { upvotes: 'desc' } :
                filters?.sortBy === 'views' ? { views: 'desc' } :
                { timestamp: 'desc' }
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
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      throw error
    }
  }

  // Update suggestion
  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    try {
      const updateData: any = { ...updates }
      delete updateData.id
      delete updateData.tags
      delete updateData.comments
      delete updateData.implementation
      delete updateData.dependencies

      await this.prisma.suggestion.update({
        where: { id },
        data: updateData
      })

      if (updates.tags) {
        await this.save({ ...(await this.get(id))!, tags: updates.tags })
      }

      if (updates.implementation) {
        await this.save({ ...(await this.get(id))!, implementation: updates.implementation })
      }

      if (updates.dependencies) {
        await this.save({ ...(await this.get(id))!, dependencies: updates.dependencies })
      }
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
      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to delete suggestion:', error)
      throw error
    }
  }

  // Get statistics
  async getStats(): Promise<SuggestionStats> {
    try {
      const [
        totalSuggestions,
        pendingCount,
        approvedCount,
        implementedCount,
        rejectedCount,
        categoryStats,
        complexityStats,
        topRated,
        mostViewed,
        recentlyAdded
      ] = await Promise.all([
        this.prisma.suggestion.count(),
        this.prisma.suggestion.count({ where: { status: 'PENDING' } }),
        this.prisma.suggestion.count({ where: { status: 'APPROVED' } }),
        this.prisma.suggestion.count({ where: { status: 'IMPLEMENTED' } }),
        this.prisma.suggestion.count({ where: { status: 'REJECTED' } }),
        this.getCategoryStats(),
        this.getComplexityStats(),
        this.getTopRatedSuggestions(),
        this.getMostViewedSuggestions(),
        this.getRecentlyAddedSuggestions()
      ])

      return {
        totalSuggestions,
        pendingCount,
        approvedCount,
        implementedCount,
        rejectedCount,
        categoryStats,
        complexityStats,
        topRated,
        mostViewed,
        recentlyAdded,
        lastUpdated: new Date()
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
        this.prisma.userInteraction.deleteMany(),
        this.prisma.dependency.deleteMany(),
        this.prisma.implementation.deleteMany(),
        this.prisma.comment.deleteMany(),
        this.prisma.suggestionTag.deleteMany(),
        this.prisma.suggestion.deleteMany(),
        this.prisma.tag.deleteMany(),
        this.prisma.statistics.deleteMany()
      ])
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw error
    }
  }

  // Private helper methods
  private async updateStatistics(): Promise<SuggestionStats> {
    const stats = await this.getStats()
    
    await this.prisma.statistics.upsert({
      where: { id: 'main' },
      update: {
        totalSuggestions: stats.totalSuggestions,
        pendingCount: stats.pendingCount,
        approvedCount: stats.approvedCount,
        implementedCount: stats.implementedCount,
        rejectedCount: stats.rejectedCount,
        lastUpdated: stats.lastUpdated
      },
      create: {
        id: 'main',
        totalSuggestions: stats.totalSuggestions,
        pendingCount: stats.pendingCount,
        approvedCount: stats.approvedCount,
        implementedCount: stats.implementedCount,
        rejectedCount: stats.rejectedCount,
        lastUpdated: stats.lastUpdated
      }
    })

    return stats
  }

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

  private async getTopRatedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
      where: { status: { not: 'REJECTED' } },
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
      orderBy: [
        { upvotes: 'desc' },
        { downvotes: 'asc' }
      ],
      take: 10
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

  private async getMostViewedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
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
      orderBy: { views: 'desc' },
      take: 10
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

  private async getRecentlyAddedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.prisma.suggestion.findMany({
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
      orderBy: { timestamp: 'desc' },
      take: 10
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