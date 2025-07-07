# Centralized Visualization System

## Overview

The visualization system has been completely centralized to ensure that the navigation dropdown menu and home page listing stay perfectly in sync. This system eliminates inconsistencies and makes it easy to add new visualizations. Visualizations are now categorized by status: **Verified** (production-ready) and **In Progress** (experimental).

## Architecture

### 1. Configuration Layer (`lib/navigation-config.ts`)

**Single source of truth** for all visualization data:

```typescript
export interface VisualizationOption {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: 'field' | 'flow' | 'terrain'
  translationKey: string
  features: string[]
  enabled: boolean
  order: number
  status: 'verified' | 'in-progress'  // NEW: Status-based categorization
}
```

**Key Features:**
- Centralized visualization definitions
- Enable/disable visualizations with `enabled` flag
- Control display order with `order` property
- **Status-based categorization**: `verified` vs `in-progress`
- Categorized visualizations for future filtering
- Translation keys for internationalization
- Feature lists for home page display

### 2. Preview Components (`lib/preview-components.tsx`)

**Centralized preview components** for home page cards:

```typescript
export const previewComponents = {
  'grid-field': GridFieldPreview,
  'flow-field': FlowFieldPreview,
  'turbulence': TurbulencePreview,
  // ... all visualizations
}
```

**Benefits:**
- Consistent black-and-white styling
- Automatic dark/light theme support
- Reusable across different contexts
- Easy to maintain and update

### 3. Navigation Hook (`lib/hooks/useVisualizationNavigation.ts`)

**Unified navigation logic** for dropdown menus with status separation:

```typescript
const {
  currentVisualization,
  allVisualizations,
  verifiedVisualizations,    // NEW: Only verified visualizations
  inProgressVisualizations,  // NEW: Only in-progress visualizations
  navigateToVisualization
} = useVisualizationNavigation()
```

**Features:**
- Only shows enabled visualizations
- Respects display order
- **Separates verified and in-progress visualizations**
- Handles navigation with animation pausing
- Memoized for performance

### 4. Home Page Hook (`lib/hooks/useHomePageVisualizations.ts`)

**Specialized hook** for home page with translations and previews:

```typescript
const {
  allVisualizations,
  verifiedVisualizations,    // NEW: Only verified visualizations
  inProgressVisualizations   // NEW: Only in-progress visualizations
} = useHomePageVisualizations()
// Returns: { id, title, path, icon, description, features, preview, category, order, status }
```

**Features:**
- Automatic translation handling
- Preview component integration
- Consistent with navigation data
- **Status-based separation for UI display**
- Type-safe return values

### 5. Management Utilities (`lib/visualization-manager.ts`)

**Helper functions** for system management:

```typescript
// Validate visualization configuration
const validation = validateVisualization('grid-field')

// Get system statistics
const stats = getVisualizationStats()

// Get visualizations by status
const verified = getVerifiedVisualizations()
const inProgress = getInProgressVisualizations()

// Get visualizations by category with validation
const { valid, invalid } = getVisualizationsByCategoryWithValidation('field')
```

## Status-Based Categorization

### Verified Visualizations
- **Status**: `'verified'`
- **Description**: Production-ready, thoroughly tested visualizations
- **UI Treatment**: Full opacity, prominent display
- **Current Examples**: Grid Field, Turbulence, Topography

### In Progress Visualizations
- **Status**: `'in-progress'`
- **Description**: Experimental visualizations still under development
- **UI Treatment**: Reduced opacity (80%), clearly marked as experimental
- **Current Examples**: All other visualizations

## How It Works

### Data Flow

1. **Configuration** → `lib/navigation-config.ts` defines all visualizations with status
2. **Navigation** → `useVisualizationNavigation()` separates by status
3. **Home Page** → `useHomePageVisualizations()` adds translations and previews
4. **UI Components** → Display data in separate sections with appropriate styling

### Synchronization

- **Single Source**: All data comes from `navigation-config.ts`
- **Automatic Sync**: Changes to config automatically update both navigation and home page
- **Status Separation**: Verified and in-progress visualizations are automatically separated
- **Validation**: System validates that all required components exist
- **Type Safety**: Full TypeScript support prevents inconsistencies

## UI Implementation

### Navigation Dropdown
- **Verified Section**: Green checkmark icon, full opacity
- **In Progress Section**: Amber clock icon, reduced opacity (80%)
- **Clear Labels**: "Verified" and "In Progress" section headers
- **Visual Separation**: Separator between sections

### Home Page
- **Verified Section**: Prominent display with green checkmark icon
- **In Progress Section**: Experimental label with amber clock icon
- **Opacity Difference**: In-progress cards at 80% opacity
- **Descriptive Text**: "Production-ready" vs "Experimental visualizations"

## Adding New Visualizations

### Step 1: Add to Configuration

```typescript
// lib/navigation-config.ts
{
  id: 'new-visualization',
  name: 'New Visualization',
  path: '/new-visualization',
  icon: NewIcon,
  description: 'Description of the new visualization',
  category: 'field',
  translationKey: 'newVisualization',
  features: ['feature1', 'feature2', 'feature3'],
  enabled: true,
  order: 12,
  status: 'in-progress'  // Start as in-progress, change to 'verified' when ready
}
```

### Step 2: Add Preview Component

```typescript
// lib/preview-components.tsx
export const NewVisualizationPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    {/* Your preview content */}
  </div>
)

// Add to mapping
export const previewComponents = {
  // ... existing
  'new-visualization': NewVisualizationPreview,
}
```

### Step 3: Add Translations

```json
// lib/locales/en.json
{
  "tools": {
    "newVisualization": {
      "title": "New Visualization",
      "description": "Description of the new visualization",
      "features": {
        "feature1": "Feature 1 description",
        "feature2": "Feature 2 description",
        "feature3": "Feature 3 description"
      }
    }
  }
}
```

### Step 4: Create Page

```typescript
// app/new-visualization/page.tsx
export default function NewVisualizationPage() {
  return (
    <VisualizationLayout>
      {/* Your visualization content */}
    </VisualizationLayout>
  )
}
```

### Result

The new visualization will automatically appear in:
- ✅ Navigation dropdown menu (in appropriate section)
- ✅ Home page listing (in appropriate section)
- ✅ With proper translations
- ✅ With preview component
- ✅ In correct order
- ✅ With proper categorization
- ✅ With appropriate styling based on status

## Benefits

### 1. User Experience
- **Clear Expectations**: Users know which visualizations are production-ready
- **Visual Hierarchy**: Verified visualizations are more prominent
- **Transparency**: Clear indication of development status
- **Consistent Experience**: Same categorization across all interfaces

### 2. Development Workflow
- **Easy Status Management**: Simple to change status from in-progress to verified
- **Clear Development Path**: Visualizations start as in-progress, become verified
- **Quality Control**: Forces consideration of when a visualization is ready
- **Team Communication**: Clear status for all team members

### 3. Consistency
- Navigation and home page always show the same visualizations
- Status-based separation is consistent across all interfaces
- No more manual synchronization required
- Single source of truth prevents drift

### 4. Maintainability
- Add new visualizations by updating one file
- Centralized preview components
- Easy to enable/disable visualizations
- Clear validation and error reporting
- Status-based organization

### 5. Performance
- Memoized hooks prevent unnecessary re-renders
- Efficient data flow
- Type-safe operations

### 6. Developer Experience
- Clear separation of concerns
- Comprehensive documentation
- Helper utilities for management
- Template for adding new visualizations
- Status-based validation

### 7. Scalability
- Easy to add new categories
- Support for complex filtering
- Extensible architecture
- Future-proof design
- Status-based analytics

## Validation and Quality Assurance

The system includes comprehensive validation:

```typescript
// Check if visualization is properly configured
const validation = validateVisualization('grid-field')
if (!validation.isValid) {
  console.warn('Issues found:', validation.issues)
}

// Get system statistics
const stats = getVisualizationStats()
console.log(`Total: ${stats.total}, Verified: ${stats.verified}, In Progress: ${stats.inProgress}`)

// Get visualizations by status
const verified = getVerifiedVisualizations()
const inProgress = getInProgressVisualizations()
```

## Migration from Old System

The old system had:
- ❌ Hardcoded visualization lists in multiple places
- ❌ Manual synchronization required
- ❌ Inconsistent data sources
- ❌ Difficult to add new visualizations
- ❌ No status-based organization

The new system provides:
- ✅ Single source of truth
- ✅ Automatic synchronization
- ✅ Consistent data across all components
- ✅ Easy addition of new visualizations
- ✅ Comprehensive validation
- ✅ Type safety throughout
- ✅ **Status-based categorization**
- ✅ **Clear user expectations**
- ✅ **Development workflow support**

## Future Enhancements

The system is designed to support future features:

1. **Advanced Filtering**: Category and status-based filtering
2. **Search Functionality**: Search through visualizations with status indicators
3. **Favorites System**: User-selected favorite visualizations
4. **Analytics**: Track which visualizations are most popular by status
5. **A/B Testing**: Enable/disable features for different users
6. **Beta Testing**: Allow users to opt into experimental visualizations
7. **Version History**: Track changes in visualization status over time

## Conclusion

The centralized visualization system with status-based categorization ensures that your navigation dropdown and home page listing will always stay in sync while providing clear user expectations about visualization readiness. Adding new visualizations is now a simple, well-documented process that automatically updates all parts of the system with appropriate status-based styling and organization. The architecture is scalable, maintainable, and provides a solid foundation for future enhancements. 