// Centralized styling configuration for all visualizations

export const VISUALIZATION_STYLES = {
  // Layout styles
  layout: {
    background: "min-h-screen bg-background",
    canvas: "w-full h-screen",
    main: "relative"
  },

  // Navigation styles
  navigation: {
    header: "border-b border-border/40",
    container: "w-full px-8 py-4",
    content: "flex items-center justify-between",
    backButton: "variant-ghost size-sm",
    dropdown: "flex items-center space-x-2 px-3 py-2 h-auto",
    actionButtons: "flex items-center space-x-2"
  },

  // Settings panel styles
  settingsPanel: {
    container: "fixed top-20 right-0 bottom-4 z-50",
    panel: "relative h-full bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-2xl transition-all duration-500 ease-in-out",
    header: "flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm",
    content: "flex-1 overflow-y-auto p-6",
    minimizedContent: "absolute inset-0 flex flex-col items-center justify-center space-y-4 p-2",
    toggleButton: "bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 transform-gpu text-gray-800"
  },

  // Status and help overlays
  overlays: {
    status: "fixed top-20 left-4 z-40 pointer-events-none",
    statusContent: "bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground",
    help: "fixed bottom-4 left-4 z-40 pointer-events-none",
    helpContent: "bg-background/80 backdrop-blur-sm border border-border/20 rounded-md px-3 py-2 text-sm text-muted-foreground max-w-md"
  },

  // Collapsible sections
  collapsible: {
    container: "space-y-3",
    button: "flex items-center gap-2 w-full text-left font-medium hover:text-primary transition-colors duration-200",
    chevron: "transition-transform duration-200 ease-in-out",
    content: "overflow-hidden transition-all duration-300 ease-in-out",
    contentInner: "pl-4 transition-all duration-300 ease-in-out delay-75"
  },

  // Animation classes
  animations: {
    slideIn: "translate-x-0 opacity-100 scale-100",
    slideOut: "translate-x-full opacity-80 scale-95",
    fadeIn: "opacity-100 translate-y-0",
    fadeOut: "opacity-0 translate-y-[-10px] pointer-events-none",
    expandIn: "max-h-[1000px] opacity-100",
    expandOut: "max-h-0 opacity-0",
    contentSlideIn: "translate-y-0 opacity-100",
    contentSlideOut: "translate-y-[-10px] opacity-0",
    titleSlideIn: "opacity-100 translate-x-0",
    titleSlideOut: "opacity-0 translate-x-4"
  },

  // Button styles
  buttons: {
    reset: "variant-ghost size-sm",
    export: "size-sm",
    add: "variant-outline size-sm",
    remove: "variant-ghost size-sm",
    toggle: "variant-outline size-sm"
  },

  // Form elements
  forms: {
    label: "text-sm font-medium",
    labelValue: "text-sm text-muted-foreground",
    slider: "w-full",
    checkbox: "text-sm",
    input: "w-full",
    select: "w-full"
  },

  // Spacing and layout
  spacing: {
    section: "space-y-4",
    sectionContent: "space-y-4 pl-4 mt-4",
    controls: "space-y-2",
    inline: "flex items-center space-x-2",
    between: "flex items-center justify-between",
    grid2: "grid grid-cols-2 gap-2",
    gap: {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8"
    }
  },

  // Typography
  typography: {
    title: "text-lg font-normal",
    sectionTitle: "text-base font-medium",
    label: "text-sm",
    value: "text-xs text-muted-foreground",
    help: "text-xs text-muted-foreground",
    description: "text-xs text-muted-foreground mt-1"
  },

  // Z-index layers
  zIndex: {
    canvas: "z-0",
    overlay: "z-40",
    panel: "z-50",
    button: "z-[60]"
  }
} as const

// Helper function to get consistent class names
export function getVisualizationClasses(category: keyof typeof VISUALIZATION_STYLES, key: string): string {
  const categoryStyles = VISUALIZATION_STYLES[category] as Record<string, string>
  return categoryStyles[key] || ""
}

// Common component class builders
export const buildClasses = {
  collapsibleContent: (isExpanded: boolean) => `
    ${VISUALIZATION_STYLES.collapsible.content}
    ${isExpanded ? VISUALIZATION_STYLES.animations.expandIn : VISUALIZATION_STYLES.animations.expandOut}
  `.trim(),

  collapsibleInner: (isExpanded: boolean) => `
    ${VISUALIZATION_STYLES.collapsible.contentInner}
    ${isExpanded ? VISUALIZATION_STYLES.animations.contentSlideIn : VISUALIZATION_STYLES.animations.contentSlideOut}
  `.trim(),

  statusOverlay: () => `
    ${VISUALIZATION_STYLES.overlays.status}
  `.trim(),

  helpOverlay: () => `
    ${VISUALIZATION_STYLES.overlays.help}
  `.trim()
} 