import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={[
        'block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      ].filter(Boolean).join(' ')}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea } 