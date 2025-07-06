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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const collection = await getCollection()
    const suggestion = await collection.findOne({ _id: new ObjectId(params.id) })
    if (!suggestion) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(suggestion)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggestion', details: error }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const collection = await getCollection()
    await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: data }
    )
    const updated = await collection.findOne({ _id: new ObjectId(params.id) })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update suggestion', details: error }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const collection = await getCollection()
    await collection.deleteOne({ _id: new ObjectId(params.id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete suggestion', details: error }, { status: 500 })
  }
} 