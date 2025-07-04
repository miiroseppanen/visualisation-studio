'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationBackButtonProps {
  onBack: () => void
  text?: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function NavigationBackButton({
  onBack,
  text = 'Back',
  className = '',
  variant = 'ghost',
  size = 'sm'
}: NavigationBackButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={onBack}
      className={`flex items-center space-x-1 sm:space-x-2 min-w-0 px-2 sm:px-3 py-2 touch-manipulation ${className}`}
      aria-label={`Go back${text ? ` to ${text}` : ''}`}
    >
      <ArrowLeft className="w-4 h-4 flex-shrink-0" />
      {text && <span className="hidden sm:inline truncate">{text}</span>}
    </Button>
  )
} 