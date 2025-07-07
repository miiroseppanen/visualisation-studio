import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'visualisation-waves'

async function getCollection() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  return db.collection('suggestions')
}

export async function GET() {
  try {
    console.log('=== MongoDB Debug Info ===')
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.log('MongoDB URI starts with:', process.env.MONGODB_URI?.substring(0, 20) + '...')
    console.log('MongoDB DB:', process.env.MONGODB_DB || 'visualisation-waves')
    console.log('Environment variables:', Object.keys(process.env).filter(key => key.includes('MONGODB')))
    
    const collection = await getCollection()
    console.log('Collection obtained successfully')
    const suggestions = await collection.find({}).sort({ timestamp: -1 }).toArray()
    console.log('Found suggestions count:', suggestions.length)
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('=== MongoDB Error Details ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error code:', (error as any)?.code)
    console.error('Error codeName:', (error as any)?.codeName)
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({ 
      error: 'Failed to fetch suggestions', 
      details: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      codeName: (error as any)?.codeName,
      uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const collection = await getCollection()
    const now = new Date()
    const suggestion = {
      ...data,
      upvotes: 0,
      downvotes: 0,
      status: 'pending',
      timestamp: now,
    }
    const result = await collection.insertOne(suggestion)
    return NextResponse.json({ ...suggestion, _id: result.insertedId })
  } catch (error) {
    console.error('MongoDB POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to create suggestion', 
      details: error instanceof Error ? error.message : String(error),
      uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 })
  }
} 