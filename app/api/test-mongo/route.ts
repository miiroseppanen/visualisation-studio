import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'visualisation-waves'

export async function GET() {
  try {
    console.log('=== MongoDB Test Endpoint ===')
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.log('MongoDB URI starts with:', process.env.MONGODB_URI?.substring(0, 20) + '...')
    console.log('MongoDB DB:', dbName)
    
    if (!uri) {
      return NextResponse.json({ 
        success: false, 
        error: 'MONGODB_URI environment variable is not set',
        envVars: Object.keys(process.env).filter(key => key.includes('MONGODB'))
      })
    }

    const client = new MongoClient(uri)
    console.log('Attempting to connect to MongoDB...')
    
    await client.connect()
    console.log('Successfully connected to MongoDB')
    
    // Test database access
    const db = client.db(dbName)
    console.log('Database object created for:', dbName)
    
    // List all databases (this requires admin privileges)
    try {
      const adminDb = client.db('admin')
      const databases = await adminDb.admin().listDatabases()
      console.log('Available databases:', databases.databases.map((db: any) => db.name))
    } catch (adminError) {
      console.log('Cannot list databases (admin privileges required):', adminError)
    }
    
    // Test collection operations
    try {
      const collections = await db.listCollections().toArray()
      console.log('Collections in database:', collections.map((col: any) => col.name))
      
      const suggestionsCollection = db.collection('suggestions')
      const count = await suggestionsCollection.countDocuments()
      console.log('Documents in suggestions collection:', count)
      
      return NextResponse.json({
        success: true,
        database: dbName,
        collections: collections.map((col: any) => col.name),
        suggestionsCount: count,
        connection: 'Success'
      })
    } catch (collectionError) {
      console.error('Collection operation failed:', collectionError)
      return NextResponse.json({
        success: false,
        error: 'Collection operation failed',
        details: collectionError instanceof Error ? collectionError.message : String(collectionError),
        code: (collectionError as any)?.code,
        codeName: (collectionError as any)?.codeName,
        database: dbName,
        connection: 'Success but collection access failed'
      })
    }
    
  } catch (error) {
    console.error('=== MongoDB Connection Error ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error code:', (error as any)?.code)
    console.error('Error codeName:', (error as any)?.codeName)
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({ 
      success: false,
      error: 'MongoDB connection failed', 
      details: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      codeName: (error as any)?.codeName,
      uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      database: dbName
    })
  }
} 