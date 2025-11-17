import { NextRequest, NextResponse } from 'next/server'
import { PrismaProvider } from '@/lib/database/prisma-provider'
import { LocalStorageProvider } from '@/lib/services/suggestions-service'

const prismaProvider = new PrismaProvider()
const localProvider = new LocalStorageProvider()

// Helper functions to map frontend values to database enums
function mapComplexity(frontendValue: string): 'low' | 'medium' | 'high' | 'new-visual' | 'bug' | 'improvement' | 'feature' | 'enhancement' {
  // The frontend value is already in the correct format for the VisualizationSuggestion type
  return frontendValue as any
}

function mapDifficulty(frontendValue: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (frontendValue) {
    case 'new-visual':
    case 'bug':
      return 'beginner'
    case 'improvement':
    case 'enhancement':
      return 'intermediate'
    case 'feature':
      return 'advanced'
    default:
      return 'intermediate'
  }
}

export async function GET() {
  try {
    await prismaProvider.init()
    const suggestions = await prismaProvider.getAll()
    
    await prismaProvider.close()
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Database connection failed, falling back to local storage:', error)
    
    try {
      // Fallback to local storage
      const suggestions = await localProvider.getAll()
      return NextResponse.json(suggestions)
    } catch (localError) {
      console.error('Local storage also failed:', localError)
      return NextResponse.json({ 
        error: 'Failed to fetch suggestions', 
        details: 'Both database and local storage failed',
        fallback: true
      }, { status: 500 })
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    await prismaProvider.init()
    
    const now = new Date()
    
    // Map frontend data to database schema
    const suggestion = {
      id: data.id || `suggestion-${Date.now()}`,
      title: data.title,
      description: data.description,
      author: data.author,
      timestamp: now,
      lastModified: now,
      upvotes: 0,
      downvotes: 0,
      status: 'pending' as const,
      category: data.category || 'general',
      complexity: mapComplexity(data.complexity),
      difficulty: mapDifficulty(data.complexity),
      estimatedDevTime: data.estimatedDevTime || 0,
      version: '1.0.0',
      createdBy: data.author,
      views: 0,
      favorites: 0,
      tags: data.tags || [],
      comments: [],
      implementation: data.implementation,
      dependencies: data.dependencies || []
    }
    
    await prismaProvider.save(suggestion)
    await prismaProvider.close()
    
    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('Database connection failed, falling back to local storage:', error)
    
    try {
      // Fallback to local storage
      const data = await req.json()
      const now = new Date()
      
      const suggestion = {
        id: data.id || `suggestion-${Date.now()}`,
        title: data.title,
        description: data.description,
        author: data.author,
        timestamp: now,
        lastModified: now,
        upvotes: 0,
        downvotes: 0,
        status: 'pending' as const,
        category: data.category || 'general',
        complexity: mapComplexity(data.complexity),
        difficulty: mapDifficulty(data.complexity),
        estimatedDevTime: data.estimatedDevTime || 0,
        version: '1.0.0',
        createdBy: data.author,
        views: 0,
        favorites: 0,
        tags: data.tags || [],
        comments: [],
        implementation: data.implementation,
        dependencies: data.dependencies || []
      }
      
      await localProvider.save(suggestion)
      return NextResponse.json(suggestion)
    } catch (localError) {
      console.error('Local storage also failed:', localError)
      return NextResponse.json({ 
        error: 'Failed to create suggestion', 
        details: 'Both database and local storage failed',
        fallback: true
      }, { status: 500 })
    }
  }
} 