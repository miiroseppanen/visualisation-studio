# Centralized Layout and Styling System

This directory contains the centralized layout components and styling system for all visualizations in the project.

## Overview

The centralized system ensures consistent styling, behavior, and animations across all visualization tools. It consists of:

1. **VisualizationLayout** - Main layout component
2. **VISUALIZATION_STYLES** - Centralized style definitions
3. **CollapsibleSection** - Reusable animated collapsible component

## Components

### VisualizationLayout

The main layout component that wraps all visualization pages. It provides:

- Consistent navigation bar with dynamic action buttons
- Settings panel integration
- Status and help text overlays
- Standardized layout structure

**Usage:**
```tsx
import VisualizationLayout from '@/components/layout/VisualizationLayout'

<VisualizationLayout
  onReset={resetAllSettings}
  onExportSVG={exportSVG}
  statusContent={<>Status info here</>}
  helpText="Instructions for users"
  settingsContent={<>Settings components here</>}
>
  <canvas ref={canvasRef} />
</VisualizationLayout>
```

**Props:**
- `children` - Main visualization content (usually a canvas)
- `onReset?` - Optional reset function (adds Reset button to nav)
- `onExportSVG?` - Optional export function (adds SVG button to nav)
- `statusContent?` - Optional status information overlay
- `helpText?` - Optional help text displayed at bottom left
- `settingsContent` - Settings panel content

### CollapsibleSection

Reusable animated collapsible component with consistent styling:

```tsx
import { CollapsibleSection } from '@/components/ui/collapsible-section'

<CollapsibleSection
  title="Section Title"
  expanded={isExpanded}
  onToggle={() => setIsExpanded(!isExpanded)}
>
  <div>Section content</div>
</CollapsibleSection>
```

## Styling System

### VISUALIZATION_STYLES

Centralized style definitions in `lib/visualization-styles.ts`:

```tsx
import { VISUALIZATION_STYLES, buildClasses } from '@/lib/visualization-styles'

// Use predefined styles
<div className={VISUALIZATION_STYLES.settingsPanel.container}>

// Use dynamic class builders
<div className={buildClasses.settingsPanel(isOpen)}>
```

### Style Categories

- **layout** - Basic layout classes
- **navigation** - Navigation bar styles
- **settingsPanel** - Settings panel styles
- **overlays** - Status and help overlay styles
- **collapsible** - Collapsible section styles
- **animations** - Animation state classes
- **buttons** - Button variant styles
- **forms** - Form element styles
- **spacing** - Layout and spacing utilities
- **typography** - Text styling
- **zIndex** - Z-index layer management

### Helper Functions

- `getVisualizationClasses(category, key)` - Get specific style classes
- `buildClasses.*` - Dynamic class builders for stateful components

## Migration Guide

To migrate an existing visualization page:

1. **Import the layout:**
   ```tsx
   import VisualizationLayout from '@/components/layout/VisualizationLayout'
   ```

2. **Remove old imports:**
   ```tsx
   // Remove these:
   import VisualizationNav from '@/components/VisualizationNav'
   import ControlsPanel from '@/components/ControlsPanel'
   import { Button } from '@/components/ui/button'
   import { Download, RotateCcw } from 'lucide-react'
   ```

3. **Wrap your content:**
   ```tsx
   return (
     <VisualizationLayout
       onReset={resetFunction}
       onExportSVG={exportFunction}
       statusContent={<>Status info</>}
       helpText="User instructions"
       settingsContent={<>Settings components</>}
     >
       <canvas ref={canvasRef} />
     </VisualizationLayout>
   )
   ```

4. **Update settings components:**
   ```tsx
   // Use CollapsibleSection for consistent animations
   import { CollapsibleSection } from '@/components/ui/collapsible-section'
   
   <CollapsibleSection
     title="Settings"
     expanded={expanded}
     onToggle={onToggle}
   >
     {/* Settings content */}
   </CollapsibleSection>
   ```

## Benefits

1. **Consistency** - All visualizations have identical layout and behavior
2. **Maintainability** - Centralized styles make updates easier
3. **Performance** - Shared components reduce bundle size
4. **Animations** - Consistent, smooth animations across all tools
5. **Accessibility** - Standardized keyboard navigation and ARIA labels
6. **Responsive** - Consistent responsive behavior
7. **Future-proof** - Easy to add new visualizations with the same UX

## Best Practices

1. **Always use VisualizationLayout** for new visualization pages
2. **Use VISUALIZATION_STYLES** for consistent styling
3. **Prefer CollapsibleSection** over custom collapsible implementations
4. **Keep settings content in separate components** for better organization
5. **Use the centralized animation classes** for consistent timing
6. **Test on different screen sizes** to ensure responsive behavior

## Examples

See `app/grid-field/page.tsx` for a complete example of the new layout system in use. 