'use client'

import React, { useState, useEffect } from 'react'

export default function TestSimplePage() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    console.log('TestSimplePage: Setting isClient to true')
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-base text-muted-foreground bg-background/90 px-4 py-2 rounded">
          Test Loading... (Client: {isClient ? 'true' : 'false'})
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">Test Simple Page</h1>
      <p>This is a simple test page to check if client-side initialization works.</p>
      <p>Client state: {isClient ? 'true' : 'false'}</p>
    </div>
  )
} 