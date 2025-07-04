"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListCardProps {
  icon?: React.ReactNode
  iconColor?: string
  title: string
  subtitle?: string
  onRemove?: () => void
  showRemoveButton?: boolean
  children?: React.ReactNode
  className?: string
  // Type switching props
  typeOptions?: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    color?: string
  }>
  currentType?: string
  onTypeChange?: (newType: string) => void
  showTypeSwitch?: boolean
}

export function ListCard({
  icon,
  iconColor,
  title,
  subtitle,
  onRemove,
  showRemoveButton = true,
  children,
  className,
  typeOptions,
  currentType,
  onTypeChange,
  showTypeSwitch = false
}: ListCardProps) {
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const currentTypeOption = typeOptions?.find(option => option.value === currentType)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
    }

    if (showTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTypeDropdown])

  return (
    <div className={cn(
      "p-4 border bg-white/90 dark:bg-black/80 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 w-full",
      className
    )}>
      {/* Top row: Icon, Name, Dispose */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Tappable polarity/type icon */}
          {showTypeSwitch && typeOptions && onTypeChange ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1 px-1 py-1 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div 
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ color: iconColor }}
                >
                  {React.cloneElement(icon as React.ReactElement, { 
                    className: "w-8 h-8",
                    style: { color: iconColor }
                  })}
                </div>
                <div className="w-0 h-0 border-t-[5px] border-t-gray-600 dark:border-t-gray-300 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent"></div>
              </button>
              
              {showTypeDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 shadow-lg z-10 min-w-36">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onTypeChange(option.value)
                        setShowTypeDropdown(false)
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors",
                        option.value === currentType && "bg-gray-50 dark:bg-gray-800"
                      )}
                    >
                      {option.icon && (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {React.cloneElement(option.icon as React.ReactElement, { 
                            className: "w-4 h-4",
                            style: { color: option.color }
                          })}
                        </div>
                      )}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            icon && (
              <div 
                className="w-10 h-10 flex items-center justify-center"
                style={{ color: iconColor }}
              >
                {React.cloneElement(icon as React.ReactElement, { 
                  className: "w-8 h-8",
                  style: { color: iconColor }
                })}
              </div>
            )
          )}
          
          {/* Element name */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
            {subtitle && (
              <span className="text-xs text-gray-600 dark:text-gray-300">{subtitle}</span>
            )}
          </div>
        </div>
        
        {/* Dispose icon */}
        {showRemoveButton && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {/* Bottom section: Strength slider and other controls */}
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  )
} 