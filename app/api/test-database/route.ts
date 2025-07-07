import { NextRequest, NextResponse } from 'next/server'
import { PrismaProvider } from '@/lib/database/prisma-provider'

const prismaProvider = new PrismaProvider()

export async function GET() {
  try {
    console.log('=== Prisma Test Endpoint ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL environment variable is not set',
        envVars: Object.keys(process.env).filter(key => key.includes('DATABASE'))
      })
    }

    console.log('Attempting to connect to Neon PostgreSQL...')
    
    await prismaProvider.init()
    console.log('Successfully connected to Neon PostgreSQL')
    
    // Test database access
    const stats = await prismaProvider.getStats()
    console.log('Database statistics:', stats)
    
    // Test suggestions access
    const suggestions = await prismaProvider.getAll()
    console.log('Suggestions count:', suggestions.length)
    
    await prismaProvider.close()
    
    return NextResponse.json({
      success: true,
      database: 'Neon PostgreSQL',
      suggestionsCount: suggestions.length,
      statistics: stats,
      connection: 'Success'
    })
    
  } catch (error) {
    console.error('=== Prisma Connection Error ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({ 
      success: false,
      error: 'Prisma connection failed', 
      details: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      database: 'Neon PostgreSQL'
    })
  }
} 