'use client'

import React from 'react'
import { Bug, Lightbulb, Zap, Plus, ArrowRight, MessageSquare, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { IssueNavigation, IssueMobileNavigation } from '@/components/navigation/IssueNavigation'
import Link from 'next/link'

const features = [
  {
    icon: Bug,
    title: 'Bug Reports',
    description: 'Report issues, glitches, or unexpected behavior in the visualizations',
    color: 'bg-red-500/10 text-red-700 dark:text-red-300'
  },
  {
    icon: Plus,
    title: 'Feature Requests',
    description: 'Suggest new features, tools, or functionality for the platform',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
  },
  {
    icon: Zap,
    title: 'Improvements',
    description: 'Propose enhancements to existing features and user experience',
    color: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  {
    icon: Lightbulb,
    title: 'Creative Ideas',
    description: 'Share innovative concepts and creative visualization ideas',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
  }
]

const stats = [
  { label: 'Total Issues', value: '156', icon: MessageSquare },
  { label: 'Active Users', value: '89', icon: Users },
  { label: 'Resolved', value: '124', icon: CheckCircle },
  { label: 'This Month', value: '23', icon: TrendingUp }
]

export default function IssueLandingPage() {
  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <IssueMobileNavigation />
        <div className="hidden md:block">
          <IssueNavigation />
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Bug className="w-12 h-12 text-foreground" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Issue Tracker & Ideas
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Help us improve the Visualization Studio by reporting issues, requesting features, 
              and sharing your creative ideas. Your feedback drives our development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/issues">
                <Button className="flex items-center space-x-2 bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-lg">
                  <MessageSquare className="w-5 h-5" />
                  <span>Browse Issues</span>
                </Button>
              </Link>
              <Link href="/issues/new">
                <Button variant="outline" className="flex items-center space-x-2 h-12 px-8 text-lg">
                  <Plus className="w-5 h-5" />
                  <span>Submit New Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              What can you submit?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className={cn("inline-flex p-3 rounded-lg mb-4", feature.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-border bg-card/30">
          <div className="container mx-auto px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                How it works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Submit</h3>
                  <p className="text-muted-foreground">
                    Create a detailed issue report or feature request with all relevant information
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Discuss</h3>
                  <p className="text-muted-foreground">
                    Community members can vote, comment, and provide additional context
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Implement</h3>
                  <p className="text-muted-foreground">
                    High-priority issues and popular features get implemented by our team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to contribute?
            </h2>
            <p className="text-muted-foreground mb-8">
              Your feedback helps us create better visualizations and improve the user experience for everyone.
            </p>
            <Link href="/issues/new">
              <Button className="flex items-center space-x-2 bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-lg">
                <Plus className="w-5 h-5" />
                <span>Submit Your First Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 