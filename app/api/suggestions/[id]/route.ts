import { NextRequest, NextResponse } from 'next/server'
import { PrismaProvider } from '@/lib/database/prisma-provider'

const prismaProvider = new PrismaProvider()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prismaProvider.init()
    
    const suggestion = await prismaProvider.get(id)
    await prismaProvider.close()
    
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    
    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('Failed to get suggestion:', error)
    return NextResponse.json({ 
      error: 'Failed to get suggestion', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    await prismaProvider.init()
    await prismaProvider.update(id, data)
    await prismaProvider.close()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update suggestion:', error)
    return NextResponse.json({ 
      error: 'Failed to update suggestion', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prismaProvider.init()
    await prismaProvider.delete(id)
    await prismaProvider.close()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete suggestion:', error)
    return NextResponse.json({ 
      error: 'Failed to delete suggestion', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 