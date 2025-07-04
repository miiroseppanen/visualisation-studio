# Project Refactoring Plan: Making it More Lean

## 🎯 **Current State Analysis**

### Redundancy Issues Found:
1. **4 separate visualization hooks** (~1,000 lines total) with 80% shared patterns
2. **5 separate renderer classes** with duplicate canvas setup and drawing utilities
3. **Duplicate physics calculations** across different visualization types
4. **Repeated SVG export logic** in each renderer
5. **Similar animation loops** in every visualization
6. **Duplicate mouse interaction handling** patterns

### Bundle Size Impact:
- **Before**: ~45KB of hook code with significant duplication
- **After**: Estimated ~15KB with unified abstractions
- **Savings**: ~67% reduction in visualization logic code

## 🔧 **Refactoring Strategy**

### Phase 1: Core Abstractions ✅ CREATED

#### 1. Unified Visualization Hook (`useVisualization.ts`)
```typescript
// Replaces: useGridField, useCircularField, useTurbulence, useTopography
// Provides: Generic state management, animation loops, canvas utilities
// Savings: ~800 lines of duplicate code
```

#### 2. Unified Rendering System (`unified-renderer.ts`)
```typescript
// Replaces: Multiple renderer classes with shared base
// Provides: Common canvas operations, SVG export utilities
// Savings: ~600 lines of duplicate rendering code
```

#### 3. Physics Utilities (`physics-utils.ts`)
```typescript
// Consolidates: Mathematical calculations, field operations, geometry
// Provides: Reusable physics functions across all visualizations
// Savings: ~400 lines of duplicate physics code
```

### Phase 2: Implementation Plan

#### Step 1: Update Grid Field (Example Migration)
```typescript
// Before: ~175 lines in useGridField.ts
// After: ~50 lines using useVisualization + grid-specific logic

const useGridField = () => {
  const visualization = useVisualization({
    initialSettings: GRID_DEFAULTS,
    initialAnimationSettings: GRID_ANIMATION_DEFAULTS,
    initialPanelState: GRID_PANEL_DEFAULTS,
    initialPoles: [INITIAL_POLE],
    resetToDefaults: () => ({ /* grid defaults */ })
  })

  // Only grid-specific logic remains
  const generateGridLines = useCallback(() => {
    // Grid-specific field line generation
  }, [visualization.poles, visualization.settings])

  return { ...visualization, generateGridLines }
}
```

#### Step 2: Create Lean Renderer Classes
```typescript
// Before: ~300 lines per renderer
// After: ~100 lines per renderer (inheriting from BaseRenderer)

class GridRenderer extends BaseRenderer {
  render(gridLines: GridLine[], poles: Pole[], settings: GridSettings) {
    this.clear()
    this.drawGridLines(gridLines) // Grid-specific method
    this.drawPoles(poles, settings.scale, settings.showPoles) // Inherited
  }

  exportSVG(data: any, settings: any, config: SVGExportConfig) {
    return generateSVGExport(builder => {
      // Grid-specific SVG generation using builder
    }, config.width, config.height)
  }
}
```

#### Step 3: Consolidate Physics Calculations
```typescript
// Before: Duplicate field calculations in each physics file
// After: Unified utilities

import { PhysicsUtils } from './physics-utils'

const field = PhysicsUtils.Field.calculateCombinedField(x, y, poles)
const distance = PhysicsUtils.Math.distance(x1, y1, x2, y2)
const isClicked = PhysicsUtils.Interaction.isPoleClicked(x, y, pole)
```

## 📊 **Expected Benefits**

### Code Reduction:
- **Hooks**: 4 files → 1 base + 4 thin wrappers (70% reduction)
- **Renderers**: 5 files → 1 base + 5 thin classes (60% reduction)
- **Physics**: Multiple files → 1 unified utility (50% reduction)
- **Total**: ~2,000 lines → ~800 lines (60% overall reduction)

### Performance Improvements:
- **Bundle Size**: ~30% smaller JavaScript bundle
- **Memory Usage**: Shared instances reduce memory footprint
- **Load Time**: Faster initial load due to smaller bundle
- **Development**: Faster hot reload with less code to process

### Maintainability:
- **Single Source of Truth**: Bug fixes apply to all visualizations
- **Consistent Behavior**: All visualizations behave identically
- **Easier Testing**: Test core logic once, not 4 times
- **Faster Feature Development**: New visualizations can be created in hours

## 🚀 **Migration Steps**

### Step 1: Create Core Abstractions ✅ DONE
- [x] `useVisualization.ts` - Unified hook
- [x] `unified-renderer.ts` - Base renderer and utilities
- [x] `physics-utils.ts` - Common physics calculations

### Step 2: Migrate Visualizations (Recommended Order)
1. **Grid Field** (Simplest - good starting point)
2. **Circular Field** (Medium complexity)
3. **Topography** (Medium complexity)
4. **Turbulence** (Most complex - do last)

### Step 3: Remove Old Files
After migration, remove:
- `lib/hooks/useGridField.ts`
- `lib/hooks/useCircularField.ts`
- `lib/hooks/useTopography.ts`
- `lib/hooks/useTurbulence.ts`
- Individual renderer files (keep specialized methods)

### Step 4: Update Imports
Update all imports to use new unified system:
```typescript
// Old
import { useGridField } from '@/lib/hooks/useGridField'

// New
import { useGridField } from '@/lib/hooks/useGridField' // Now a thin wrapper
```

## 🔍 **Additional Optimizations**

### 1. Component Consolidation
Many visualization components share similar patterns:
- **Settings Components**: Could share a base settings component
- **Control Panels**: Already centralized ✅
- **Animation Controls**: Could be made more generic

### 2. Type System Optimization
- **Generic Types**: Use more generic types to reduce duplication
- **Type Unions**: Combine similar types where possible
- **Interface Inheritance**: Use inheritance for shared properties

### 3. Build Optimization
- **Tree Shaking**: Ensure unused code is eliminated
- **Code Splitting**: Split visualization-specific code into separate chunks
- **Dynamic Imports**: Load visualization code only when needed

## 📋 **Testing Strategy**

### Before Migration:
1. **Capture Current Behavior**: Screenshot/video each visualization
2. **Document Edge Cases**: Note any specific behaviors
3. **Performance Baseline**: Measure current bundle size and performance

### During Migration:
1. **Visual Regression Testing**: Compare before/after screenshots
2. **Functionality Testing**: Ensure all features work identically
3. **Performance Testing**: Verify improvements are achieved

### After Migration:
1. **Bundle Analysis**: Confirm size reduction
2. **Performance Metrics**: Measure load time improvements
3. **Developer Experience**: Ensure development workflow is improved

## 🎯 **Success Metrics**

### Code Quality:
- [ ] 60%+ reduction in total lines of code
- [ ] Zero duplicate logic patterns
- [ ] Single source of truth for all common operations

### Performance:
- [ ] 30%+ reduction in bundle size
- [ ] Faster initial load time
- [ ] Reduced memory usage

### Developer Experience:
- [ ] New visualizations can be created in <4 hours
- [ ] Bug fixes apply to all visualizations automatically
- [ ] Consistent behavior across all tools

## 🔄 **Rollback Plan**

If issues arise during migration:
1. **Keep old files** until migration is complete
2. **Feature flags** to switch between old/new implementations
3. **Gradual migration** - one visualization at a time
4. **Automated tests** to catch regressions early

This refactoring will transform the project from a collection of similar tools into a cohesive, maintainable system while significantly reducing complexity and improving performance. 