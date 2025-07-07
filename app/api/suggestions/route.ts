import { NextRequest, NextResponse } from 'next/server'
import { PrismaProvider } from '@/lib/database/prisma-provider'

const prismaProvider = new PrismaProvider()

export async function GET() {
  try {
    console.log('=== Prisma Debug Info ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    await prismaProvider.init()
    const suggestions = await prismaProvider.getAll()
    console.log('Found suggestions count:', suggestions.length)
    
    await prismaProvider.close()
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('=== Prisma Error Details ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({ 
      error: 'Failed to fetch suggestions', 
      details: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    await prismaProvider.init()
    
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
      complexity: data.complexity || 'medium' as const,
      difficulty: data.difficulty || 'intermediate' as const,
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
    console.error('Prisma POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to create suggestion', 
      details: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 })
  }
} 