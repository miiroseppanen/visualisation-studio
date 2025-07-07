# Visualization Studio

A professional pattern generation toolkit for creative branding and packaging design. Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control. Built with Next.js, TypeScript, and Tailwind CSS, following Dieter Rams' design principles.

## Features

- **Grid Field Visualization**: Create interactive grid patterns that respond to magnetic poles
- **Flow Field Visualization**: Design magnetic field illustrations with custom poles and particle systems
- **Circular Field Visualization**: Visualize circular field lines around magnetic poles
- **Wave Interference**: Explore wave interference patterns with multiple sources
- **Particle Swarm**: Watch particles flock and swarm with emergent behavior
- **Neural Network**: Interactive neural network with animated connections and learning
- **Cellular Automata**: Conway's Game of Life with custom rules and patterns
- **Sound Wave**: Real-time audio waveform with frequency analysis
- **Topography**: Generate topographic contour lines from elevation points
- **Turbulence**: Explore turbulent flow fields with vortices and noise
- **Real-time Preview**: See changes instantly as you adjust parameters
- **SVG Export**: Export illustrations as scalable vector graphics
- **Minimal Design**: Clean, functional interface following "Less, but better" philosophy

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Database**: Neon PostgreSQL with Prisma ORM
- **Design**: Dieter Rams-inspired minimal design

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
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

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run the development server:
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

### Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

1. **Environment Variables**: Set the following environment variable in your Vercel project:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., Neon, Supabase, etc.)

2. **Build Process**: The build process automatically:
   - Generates the Prisma client (`npx prisma generate`)
   - Builds the Next.js application (`npm run build`)

3. **Database**: The application uses PostgreSQL with Prisma ORM. Make sure your database is accessible from Vercel's servers.

### Build Configuration

The project includes:
- `postinstall` script to generate Prisma client after dependencies are installed
- Modified `vercel.json` to include Prisma generation in the build command
- TypeScript and ESLint errors are ignored during build to prevent deployment issues

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 