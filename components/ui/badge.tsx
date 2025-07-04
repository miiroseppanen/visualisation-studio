import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        variant === 'default' && 'bg-accent text-accent-foreground',
        variant === 'outline' && 'border border-border bg-transparent text-foreground',
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge } 