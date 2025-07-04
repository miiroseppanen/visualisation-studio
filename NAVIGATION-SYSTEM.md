# Navigation System Documentation

## Overview

The navigation system has been completely refactored to separate concerns, improve maintainability, and provide better modularity. The system is now split into:

1. **Configuration Layer** - Data and configuration
2. **Logic Layer** - Business logic and state management
3. **UI Layer** - Presentation components

## Architecture

### 1. Configuration Layer (`lib/navigation-config.ts`)

Contains all navigation-related data and configuration:

```typescript
interface VisualizationOption {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: 'field' | 'flow' | 'terrain'
}
```

**Key Features:**
- Centralized visualization definitions
- Type-safe configuration
- Utility functions for querying visualizations
- Categorized visualizations for future filtering

### 2. Logic Layer (`lib/hooks/useNavigationLogic.ts`)

Encapsulates all navigation logic in a custom hook:

```typescript
const {
  currentVisualization,
  allVisualizations,
  isOnVisualizationPage,
  isOnHomePage,
  navigateToVisualization,
  navigateToPath,
  navigateBack,
  navigateHome,
} = useNavigationLogic()
```

**Key Features:**
- Memoized state calculations for performance
- Programmatic navigation methods
- Current page detection
- Fallback navigation logic

### 3. UI Layer (Components)

#### Main Navigation Component (`components/VisualizationNav.tsx`)

The main navigation component that orchestrates all other components:

```typescript
<VisualizationNav 
  onReset={onReset}
  onExportSVG={onExportSVG}
  showBackButton={true}
  backButtonText="Back"
  backButtonFallbackPath="/"
  additionalActionButtons={<CustomButton />}
  leftContent={<CustomLeftContent />}
  rightContent={<CustomRightContent />}
/>
```

#### Modular Sub-Components

1. **VisualizationDropdown** (`components/navigation/VisualizationDropdown.tsx`)
   - Handles visualization selection
   - Displays current visualization
   - Shows all available options with descriptions

2. **NavigationBackButton** (`components/navigation/NavigationBackButton.tsx`)
   - Configurable back button
   - Supports custom text and styling
   - Handles browser history fallback

3. **NavigationActionButtons** (`components/navigation/NavigationActionButtons.tsx`)
   - Common action buttons (Reset, Export SVG)
   - Support for additional custom buttons
   - Consistent styling and behavior

## Usage Examples

### Basic Usage

```typescript
// In a visualization page
export default function MyVisualizationPage() {
  const handleReset = () => { /* reset logic */ }
  const handleExport = () => { /* export logic */ }

  return (
    <VisualizationLayout
      onReset={handleReset}
      onExportSVG={handleExport}
      settingsContent={<MySettings />}
    >
      <MyVisualization />
    </VisualizationLayout>
  )
}
```

### Advanced Usage with Custom Content

```typescript
<VisualizationNav 
  onReset={handleReset}
  onExportSVG={handleExport}
  showBackButton={true}
  backButtonText="← Dashboard"
  backButtonFallbackPath="/dashboard"
  additionalActionButtons={
    <Button onClick={handleSave}>Save</Button>
  }
  leftContent={
    <div className="text-sm text-muted-foreground">
      Last saved: {lastSavedTime}
    </div>
  }
  rightContent={
    <StatusIndicator status={status} />
  }
/>
```

### Direct Hook Usage

```typescript
function CustomNavigationComponent() {
  const {
    currentVisualization,
    allVisualizations,
    navigateToVisualization,
    isOnVisualizationPage
  } = useNavigationLogic()

  return (
    <div>
      {isOnVisualizationPage ? (
        <h1>Current: {currentVisualization?.name}</h1>
      ) : (
        <h1>Select a visualization</h1>
      )}
      
      {allVisualizations.map(viz => (
        <button
          key={viz.id}
          onClick={() => navigateToVisualization(viz.id)}
        >
          {viz.name}
        </button>
      ))}
    </div>
  )
}
```

## Configuration

### Adding New Visualizations

1. Add to `lib/navigation-config.ts`:

```typescript
export const visualizationOptions: VisualizationOption[] = [
  // ... existing visualizations
  {
    id: 'new-visualization',
    name: 'New Visualization',
    path: '/new-visualization',
    icon: NewIcon,
    description: 'Description of the new visualization',
    category: 'field'
  }
]
```

2. Create the page at `app/new-visualization/page.tsx`
3. The navigation will automatically include the new visualization

### Customizing Categories

The system supports categorization for future filtering:

```typescript
const fieldVisualizations = getVisualizationsByCategory('field')
const flowVisualizations = getVisualizationsByCategory('flow')
const terrainVisualizations = getVisualizationsByCategory('terrain')
```

## Benefits of the New System

1. **Separation of Concerns**: UI, logic, and data are clearly separated
2. **Reusability**: Components can be used independently
3. **Testability**: Logic is isolated in hooks, making testing easier
4. **Maintainability**: Changes to navigation logic don't affect UI
5. **Extensibility**: Easy to add new visualizations or modify behavior
6. **Type Safety**: Full TypeScript support throughout
7. **Performance**: Memoized calculations prevent unnecessary re-renders

## Migration Guide

### From Old System

The old system had everything in one component. To migrate:

1. **Replace hard-coded visualization arrays** with imports from `navigation-config.ts`
2. **Replace inline navigation logic** with the `useNavigationLogic` hook  
3. **Replace monolithic navigation component** with modular components
4. **Update prop interfaces** to match new component APIs

### Backward Compatibility

The main `VisualizationNav` component maintains backward compatibility for basic usage. However, some prop names have changed:

- `actionButtons` → `additionalActionButtons`
- `backButtonHref` → `backButtonFallbackPath`

## Future Enhancements

1. **Breadcrumbs**: Easy to add with the current architecture
2. **Search/Filter**: Can be added to the dropdown component
3. **Favorites**: User preferences can be stored and managed
4. **Keyboard Navigation**: Can be added to individual components
5. **Analytics**: Navigation events can be tracked through the hook
6. **Accessibility**: Each component can be enhanced independently

## File Structure

```
lib/
├── navigation-config.ts          # Configuration and data
└── hooks/
    └── useNavigationLogic.ts     # Business logic hook

components/
├── VisualizationNav.tsx          # Main navigation component
├── navigation/
│   ├── index.ts                  # Barrel exports
│   ├── VisualizationDropdown.tsx # Dropdown component
│   ├── NavigationBackButton.tsx  # Back button component
│   └── NavigationActionButtons.tsx # Action buttons component
└── layout/
    └── VisualizationLayout.tsx   # Layout wrapper
```

This architecture provides a solid foundation for future navigation enhancements while maintaining clean separation of concerns and excellent developer experience. 