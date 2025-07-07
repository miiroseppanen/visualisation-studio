import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'visualisation-waves'

export async function GET() {
  try {
    console.log('=== Testing MongoDB Connection ===')
    console.log('URI exists:', !!uri)
    console.log('URI starts with:', uri.substring(0, 30) + '...')
    
    const client = new MongoClient(uri)
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(dbName)
    console.log('Database accessed:', dbName)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    // Check if suggestions collection exists
    const suggestionsExists = collections.some(c => c.name === 'suggestions')
    console.log('Suggestions collection exists:', suggestionsExists)
    
    // Try to access the suggestions collection
    const suggestionsCollection = db.collection('suggestions')
    console.log('Collection object created')
    
    // Try a simple operation
    const count = await suggestionsCollection.countDocuments()
    console.log('Document count:', count)
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      collections: collections.map(c => c.name),
      suggestionsExists,
      documentCount: count,
      uri: uri ? 'Set' : 'Not set'
    })
    
  } catch (error) {
    console.error('=== Test Error ===')
    console.error('Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      codeName: (error as any)?.codeName,
      uri: uri ? 'Set' : 'Not set'
    }, { status: 500 })
  }
} 