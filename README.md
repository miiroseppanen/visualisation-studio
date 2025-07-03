# Magnetic Field Visualizations

A modern, interactive visualization of magnetic fields built with React, Next.js, and shadcn/ui. Features kinetic animations, real-time interactions, and SVG export capabilities.

## ✨ Features

- **Flow Field Visualization**: Animated field lines that flow like wind with particle systems
- **Grid Field Visualization**: Grid of short lines pointing in magnetic field directions
- **Modern UI**: Built with shadcn/ui components for a professional, accessible interface
- **Interactive Controls**: Real-time parameter adjustment with smooth animations
- **SVG Export**: Export visualizations as vector graphics for use in publications
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Black & White + Blue Accent**: Clean, scientific aesthetic with vibrant highlights

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd magnetic-field-visualizations
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Gallery Page
- Browse available visualizations
- Click on cards to explore different visualization types
- Hover effects provide visual feedback

### Flow Field Visualization
- **Add Poles**: Click anywhere to add magnetic poles (alternating north/south)
- **Move Poles**: Drag poles to see real-time field changes
- **Adjust Parameters**: Use the control panel to modify:
  - Field Strength
  - Line Count
  - Animation Speed
  - Particle Visibility
- **Export**: Download as SVG or PNG with configurable options

### Grid Field Visualization
- **Grid Density**: Adjust from 10x10 to 100x100 grid points
- **Line Length**: Control the length of field direction indicators
- **Field Strength**: Modify magnetic field intensity
- **Real-time Updates**: Grid responds instantly to pole movements

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern component-based architecture
- **Next.js 14**: Full-stack framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### UI Components
- **shadcn/ui**: Beautiful, accessible component library
- **Radix UI**: Headless component primitives
- **Lucide React**: Modern icon library

### Visualization
- **HTML5 Canvas**: High-performance 2D graphics
- **Custom Physics Engine**: Realistic magnetic field calculations
- **SVG Generation**: Vector graphics export

## 📁 Project Structure

```
magnetic-field-visualizations/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with shadcn/ui tokens
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Gallery page
│   ├── flow-field/        # Flow visualization page
│   └── grid-field/        # Grid visualization page
├── components/
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   └── visualization/    # Custom visualization components
├── lib/
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Background**: Dark (#0a0a0a)
- **Foreground**: White (#ffffff)
- **Primary**: Blue (#3b82f6) - Accent color
- **Muted**: Gray variations for subtle elements

### Typography
- **Font**: Outfit (Google Fonts)
- **Weights**: Regular, Medium, Semibold, Bold
- **Hierarchy**: Clear text sizing and spacing

### Components
- **Cards**: Glass morphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Sliders**: Custom styled range inputs
- **Modals**: Professional dialog windows

## 🔧 Customization

### Adding New Visualizations
1. Create a new page in `app/`
2. Implement the visualization logic
3. Add navigation in the gallery
4. Update types and exports

### Modifying Colors
Edit the CSS custom properties in `app/globals.css`:
```css
:root {
  --primary: 217 91% 60%; /* Blue accent */
  --background: 0 0% 4%;  /* Dark background */
  /* ... other colors */
}
```

### Styling Components
Use Tailwind CSS classes and shadcn/ui variants:
```tsx
<Button variant="outline" size="lg">
  Custom Button
</Button>
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm start
```

### Deployment
The project is ready for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first styling approach
- **Next.js** for the excellent React framework

## 🐛 Troubleshooting

### Common Issues

**Dependencies not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
npm run build
# Check for type issues
```

**Canvas not rendering**
- Ensure browser supports HTML5 Canvas
- Check for JavaScript errors in console

### Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages

---

Built with ❤️ using modern web technologies 