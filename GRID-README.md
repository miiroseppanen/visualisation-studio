# Grid Magnetic Field Visualization

A unique magnetic field visualization that fills the canvas with a grid of short lines that respond to magnetic poles. Each line in the grid points in the direction of the magnetic field at that location, creating a beautiful field map effect.

## Features

- **Grid of Field Lines**: Canvas filled with short lines arranged in a grid pattern
- **Dynamic Response**: Lines automatically point in the direction of the magnetic field
- **Variable Grid Density**: Adjust from 10x10 to 100x100 grid points
- **Interactive Poles**: Click to add magnetic poles, drag to move them
- **Real-time Updates**: Grid lines update instantly as poles move
- **Black & White Aesthetic**: Clean, professional monochrome design
- **SVG/PNG Export**: Export as vector graphics or raster images
- **Responsive Design**: Works on any screen size

## How to Run

1. Open `grid-field.html` in any modern web browser
2. No additional dependencies or setup required

## Controls

### Interactive Controls
- **Click anywhere** to add new magnetic poles (alternating north/south)
- **Drag poles** to move them around the canvas
- **Watch the grid** respond in real-time to pole movements

### UI Controls
- **Grid Density**: Adjust the number of grid points (10-100)
- **Line Length**: Change the length of each field line (5-30 pixels)
- **Field Strength**: Control the intensity of the magnetic field
- **Animation Speed**: Adjust the wave motion speed
- **Show Grid**: Toggle the grid lines on/off
- **Show Poles**: Toggle the magnetic poles on/off

### Export Controls
- **Include Poles**: Choose whether to include poles in export
- **Include Background**: Choose whether to include dark background
- **Export as SVG**: Download as vector graphics
- **Export as PNG**: Download as raster image

## How It Works

### Grid System
- Creates a uniform grid of points across the canvas
- Each grid point has a short line that represents the field direction
- Grid density determines spacing between lines
- Lines automatically update as poles move

### Field Calculation
- Uses vector field physics to calculate magnetic field direction
- Each pole contributes to the field at every grid point
- Field strength decreases with distance (inverse square law)
- Lines point perpendicular to the force direction (magnetic field property)

### Visual Effects
- **Intensity Mapping**: Lines become brighter and thicker near strong fields
- **Wave Motion**: Subtle wave animation adds kinetic energy
- **Real-time Response**: Immediate visual feedback to pole movements

## Use Cases

### Scientific Visualization
- **Physics Education**: Demonstrate magnetic field concepts
- **Research Presentations**: Visualize field patterns
- **Laboratory Documentation**: Record experimental setups

### Design Applications
- **Abstract Art**: Create dynamic geometric patterns
- **Logo Design**: Generate unique field-based graphics
- **Background Graphics**: Animated or static field patterns

### Educational Tools
- **Interactive Demonstrations**: Students can experiment with field configurations
- **Visual Learning**: Intuitive understanding of magnetic fields
- **Problem Solving**: Test different pole arrangements

## Technical Details

### Physics Implementation
- **Vector Field Calculation**: Realistic magnetic field physics
- **Superposition Principle**: Multiple poles combine their effects
- **Inverse Square Law**: Field strength decreases with distance
- **Perpendicular Field Lines**: Accurate magnetic field representation

### Rendering System
- **HTML5 Canvas**: Smooth 60fps animation
- **Dynamic Grid Generation**: Responsive to canvas size changes
- **Intensity-based Rendering**: Visual feedback based on field strength
- **Efficient Updates**: Only recalculates necessary elements

### Export System
- **Vector Graphics**: SVG export maintains perfect quality at any scale
- **Raster Images**: PNG export captures current state
- **Configurable Elements**: Choose what to include in exports

## Customization

### Grid Parameters
- Adjust grid density for different detail levels
- Modify line length for visual impact
- Change field strength for different effects

### Visual Style
- Black and white aesthetic for professional appearance
- Intensity-based opacity and thickness
- Smooth wave animations

### Export Options
- Customize SVG generation for specific use cases
- Include or exclude different elements
- Control export quality and file size

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 Classes
- RequestAnimationFrame API
- Blob API (for export functionality)

## Comparison with Original

### Grid vs. Flow Visualization
- **Grid**: Shows field direction at discrete points
- **Flow**: Shows continuous field line paths
- **Grid**: Better for understanding field patterns
- **Flow**: Better for understanding field flow

### Use Cases
- **Grid**: Scientific analysis, pattern recognition
- **Flow**: Artistic visualization, flow dynamics
- **Grid**: More structured, systematic
- **Flow**: More organic, fluid

## Future Enhancements

- **Color Mapping**: Add color to represent field strength
- **3D Grid**: Extend to three-dimensional visualization
- **Multiple Field Types**: Electric, gravitational fields
- **Animation Export**: GIF/WebM export of animations
- **Touch Support**: Mobile device interaction
- **Collaborative Features**: Real-time sharing of configurations 