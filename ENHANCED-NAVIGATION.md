# Enhanced Navigation System

## Overview

The enhanced navigation system provides a unified, mobile-optimized navigation experience across all pages of the Visualisation Studio application. It features time-based hiding on mobile devices, improved touch interactions, and better visual feedback.

## Key Features

### 🎯 **Unified Navigation**
- Single component handles all page types (home, suggestions, visualizations)
- Consistent behavior and styling across the application
- Reduced code duplication and maintenance overhead

### 📱 **Mobile Optimization**
- **Time-based hiding**: Navigation automatically hides after 3-4 seconds of inactivity on mobile
- **Touch-friendly**: All interactive elements meet minimum touch target requirements (44px)
- **Gesture support**: Swipe-to-dismiss functionality for panels
- **Responsive design**: Adapts seamlessly between mobile and desktop layouts

### ⚡ **Performance Optimizations**
- Memoized components to prevent unnecessary re-renders
- Efficient event handling with passive listeners
- Optimized animations using CSS transforms
- Reduced bundle size through component consolidation

### 🎨 **Enhanced UX**
- Smooth transitions and animations
- Visual feedback for user interactions
- Improved accessibility with proper ARIA labels
- Better visual hierarchy and spacing

## Component Architecture

### EnhancedNavigation
The main navigation component that adapts based on the `pageType` prop:

```typescript
interface EnhancedNavigationProps {
  pageType?: 'home' | 'suggestions' | 'visualization'
  
  // Suggestions page props
  isAuthenticated?: boolean
  onAdminClick?: () => void
  onLogout?: () => void
  
  // Visualization page props
  onReset?: () => void
  onExportSVG?: () => void
  additionalActionButtons?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  
  // General props
  className?: string
  hideNonEssential?: boolean
}
```

### EnhancedControlsPanel
An improved settings panel with mobile-first design:

```typescript
interface EnhancedControlsPanelProps {
  children: React.ReactNode
  title?: string
  isOpen?: boolean
  onToggle?: () => void
  autoHideDelay?: number // Time in milliseconds before auto-hiding
  showMinimizeButton?: boolean
  onMinimize?: () => void
  isMinimized?: boolean
}
```

### EnhancedVisualizationLayout
A layout component that integrates navigation and settings:

```typescript
interface EnhancedVisualizationLayoutProps {
  children: React.ReactNode
  onReset?: () => void
  onExportSVG?: () => void
  statusContent?: React.ReactNode
  helpText?: string
  settingsContent?: React.ReactNode
  panelOpen?: boolean
  onPanelToggle?: () => void
  showVisualizationNav?: boolean
  autoHideDelay?: number
  showMinimizeButton?: boolean
  onPanelMinimize?: () => void
  isPanelMinimized?: boolean
}
```

## Usage Examples

### Home Page Navigation
```tsx
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation'

export default function HomePage() {
  return (
    <AppLayout showNavigation={false}>
      <EnhancedNavigation pageType="home" />
      {/* Page content */}
    </AppLayout>
  )
}
```

### Suggestions Page Navigation
```tsx
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation'

export default function SuggestionsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  return (
    <AppLayout showNavigation={false}>
      <EnhancedNavigation 
        pageType="suggestions"
        isAuthenticated={isAuthenticated}
        onAdminClick={() => setShowPinModal(true)}
        onLogout={() => setIsAuthenticated(false)}
      />
      {/* Page content */}
    </AppLayout>
  )
}
```

### Visualization Page Navigation
```tsx
import EnhancedVisualizationLayout from '@/components/layout/EnhancedVisualizationLayout'

export default function VisualizationPage() {
  return (
    <EnhancedVisualizationLayout
      onReset={handleReset}
      onExportSVG={exportSVG}
      statusContent="Status information"
      helpText="Help text for users"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={<SettingsComponent />}
      autoHideDelay={4000}
      showMinimizeButton={true}
    >
      <canvas ref={canvasRef} />
    </EnhancedVisualizationLayout>
  )
}
```

## Mobile-Specific Features

### Time-Based Hiding
The navigation automatically hides after a configurable delay (default: 4 seconds) on mobile devices when:
- No user interaction is detected
- The user is not actively using the interface
- The device is in mobile mode

### Touch Interactions
- **Swipe to dismiss**: Panels can be dismissed by swiping down
- **Tap to show**: Hidden UI elements appear on tap
- **Drag handles**: Visual indicators for draggable elements
- **Haptic feedback**: Vibration feedback on supported devices

### Responsive Behavior
- **Mobile**: Bottom sheet design with backdrop overlay
- **Desktop**: Side panel design with slide-in animation
- **Tablet**: Adaptive layout that scales between mobile and desktop

## Configuration Options

### Auto-Hide Settings
```typescript
// Customize auto-hide behavior
<EnhancedControlsPanel
  autoHideDelay={6000} // 6 seconds
  showMinimizeButton={false}
>
  {/* Panel content */}
</EnhancedControlsPanel>
```

### Navigation Visibility
```typescript
// Control when navigation is visible
<EnhancedNavigation
  hideNonEssential={!isUIVisible}
  showBackButton={isUIVisible}
/>
```

### Panel States
```typescript
// Manage panel states
const [panelState, setPanelState] = useState({
  isOpen: true,
  isMinimized: false
})

<EnhancedControlsPanel
  isOpen={panelState.isOpen}
  isMinimized={panelState.isMinimized}
  onMinimize={() => setPanelState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
>
  {/* Panel content */}
</EnhancedControlsPanel>
```

## Migration Guide

### From Old Navigation System
1. **Replace imports**:
   ```tsx
   // Old
   import { SuggestionsNavigation, SuggestionsMobileNavigation } from '@/components/navigation/PageNavigation'
   
   // New
   import EnhancedNavigation from '@/components/navigation/EnhancedNavigation'
   ```

2. **Update component usage**:
   ```tsx
   // Old
   <SuggestionsMobileNavigation />
   <SuggestionsNavigation />
   
   // New
   <EnhancedNavigation pageType="suggestions" />
   ```

3. **Update layout components**:
   ```tsx
   // Old
   import VisualizationLayout from '@/components/layout/VisualizationLayout'
   
   // New
   import EnhancedVisualizationLayout from '@/components/layout/EnhancedVisualizationLayout'
   ```

### From Old Controls Panel
1. **Replace imports**:
   ```tsx
   // Old
   import ControlsPanel from '@/components/ControlsPanel'
   
   // New
   import EnhancedControlsPanel from '@/components/EnhancedControlsPanel'
   ```

2. **Add new props**:
   ```tsx
   // Old
   <ControlsPanel title="Settings" isOpen={isOpen} onToggle={onToggle}>
     {content}
   </ControlsPanel>
   
   // New
   <EnhancedControlsPanel 
     title="Settings" 
     isOpen={isOpen} 
     onToggle={onToggle}
     autoHideDelay={4000}
     showMinimizeButton={true}
   >
     {content}
   </EnhancedControlsPanel>
   ```

## Performance Considerations

### Optimizations Implemented
- **Memoization**: Components use `React.useMemo` for expensive calculations
- **Event delegation**: Efficient event handling with passive listeners
- **CSS transforms**: Hardware-accelerated animations
- **Lazy loading**: Components load only when needed

### Best Practices
- Use `hideNonEssential` prop to reduce rendering when UI is hidden
- Implement proper cleanup in `useEffect` hooks
- Avoid unnecessary re-renders by memoizing callbacks
- Use CSS transforms instead of layout-triggering properties

## Accessibility Features

### ARIA Support
- Proper `aria-label` attributes for all interactive elements
- Screen reader friendly navigation structure
- Keyboard navigation support
- Focus management for modal dialogs

### Visual Accessibility
- High contrast mode support
- Reduced motion preferences respected
- Clear visual hierarchy
- Consistent touch targets

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Feature Detection
The system automatically detects and adapts to:
- Touch capability
- Screen size and orientation
- Device pixel ratio
- Browser capabilities

## Troubleshooting

### Common Issues

1. **Navigation not hiding on mobile**
   - Check if `useMobileUI` hook is properly configured
   - Verify device detection is working
   - Ensure touch events are not being blocked

2. **Panel not responding to gestures**
   - Check if touch event handlers are properly attached
   - Verify CSS transforms are not interfering
   - Ensure no other elements are capturing touch events

3. **Performance issues**
   - Check for memory leaks in event listeners
   - Verify memoization is working correctly
   - Monitor re-render frequency

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
NEXT_PUBLIC_DEBUG_NAVIGATION=true
```

This will log navigation state changes and user interactions to the console.

## Future Enhancements

### Planned Features
- **Gesture customization**: Allow users to customize gesture controls
- **Theme integration**: Better integration with theme system
- **Animation preferences**: Respect user's motion preferences
- **Offline support**: Cache navigation state for offline use

### Performance Improvements
- **Virtual scrolling**: For large navigation menus
- **Progressive loading**: Load navigation components on demand
- **Service worker integration**: Cache navigation assets
- **Bundle optimization**: Further reduce component size

## Contributing

When contributing to the navigation system:

1. **Follow the existing patterns** for component structure
2. **Test on multiple devices** and screen sizes
3. **Ensure accessibility** compliance
4. **Update documentation** for any new features
5. **Add proper TypeScript types** for all new props
6. **Include mobile testing** in your development workflow

## Support

For issues or questions about the enhanced navigation system:

1. Check the troubleshooting section above
2. Review the migration guide for common issues
3. Test on different devices and browsers
4. Check the browser console for error messages
5. Verify all dependencies are up to date 