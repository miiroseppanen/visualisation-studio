# Magnetic Field Studio

A modern, interactive web application for creating and visualizing magnetic field patterns using SVG graphics. Built with Next.js, TypeScript, and Tailwind CSS, following Dieter Rams' design principles.

## Features

- **Grid Field Visualization**: Create interactive grid patterns that respond to magnetic poles
- **Flow Field Visualization**: Design magnetic field illustrations with custom poles and particle systems
- **Real-time Preview**: See changes instantly as you adjust parameters
- **SVG Export**: Export illustrations as scalable vector graphics
- **Minimal Design**: Clean, functional interface following "Less, but better" philosophy

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Design**: Dieter Rams-inspired minimal design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd visualisation-studio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
visualisation-studio/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── grid-field/        # Grid field visualization
│   └── flow-field/        # Flow field visualization
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── VisualizationCanvas.tsx
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Design Principles

This project follows Dieter Rams' "Less, but better" philosophy:

- **Minimal decoration**: Clean, functional design
- **Honest materials**: Subtle colors, clean typography
- **Long-lasting design**: Timeless aesthetic
- **Thorough to the last detail**: Consistent spacing and interactions
- **Environmentally friendly**: Efficient use of space and resources
- **As little design as possible**: Focus on functionality over decoration

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 