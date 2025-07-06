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
    const collection = await getCollection()
    const suggestions = await collection.find({}).sort({ timestamp: -1 }).toArray()
    return NextResponse.json(suggestions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggestions', details: error }, { status: 500 })
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
    return NextResponse.json({ error: 'Failed to create suggestion', details: error }, { status: 500 })
  }
} 