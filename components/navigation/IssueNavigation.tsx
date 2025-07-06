'use client'

import React from 'react'
import { Bug, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function IssueNavigation() {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Studio</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Bug className="w-6 h-6 text-foreground" />
              <h1 className="text-xl font-bold text-foreground">Issue Tracker</h1>
            </div>
          </div>
          <Link href="/issues/new">
            <Button className="flex items-center space-x-2 bg-foreground text-background hover:bg-foreground/90">
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function IssueMobileNavigation() {
  return (
    <div className="md:hidden border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-foreground" />
              <h1 className="text-lg font-bold text-foreground">Issues</h1>
            </div>
          </div>
          <Link href="/issues/new">
            <Button size="sm" className="flex items-center space-x-1 bg-foreground text-background hover:bg-foreground/90">
              <Plus className="w-3 h-3" />
              <span>New</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 