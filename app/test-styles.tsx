'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestStyles() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Style Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is a test to verify that Tailwind CSS and shadcn/ui styles are working.
            </p>
            <div className="space-x-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg">
            Primary Background
          </div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
            Secondary Background
          </div>
        </div>
      </div>
    </div>
  )
} 