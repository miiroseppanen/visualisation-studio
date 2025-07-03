'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ChevronDown, Grid3X3, Magnet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface VisualizationOption {
  name: string
  path: string
  icon: React.ReactNode
  description: string
}

const visualizations: VisualizationOption[] = [
  {
    name: 'Grid Field',
    path: '/grid-field',
    icon: <Grid3X3 className="w-4 h-4" />,
    description: 'Create a field of lines that respond to magnetic poles'
  },
  {
    name: 'Flow Field',
    path: '/flow-field',
    icon: <Magnet className="w-4 h-4" />,
    description: 'Design magnetic field illustrations with custom poles'
  }
]

export default function VisualizationNav() {
  const pathname = usePathname()
  const currentVisualization = visualizations.find(v => v.path === pathname)

  return (
    <header className="border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-auto">
                  <div className="flex items-center space-x-2">
                    {currentVisualization?.icon}
                    <span className="text-lg font-normal">{currentVisualization?.name}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {visualizations.map((visualization) => (
                  <DropdownMenuItem key={visualization.path} asChild>
                    <Link href={visualization.path} className="flex items-start space-x-3 p-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {visualization.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-normal text-sm">
                          {visualization.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {visualization.description}
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
} 