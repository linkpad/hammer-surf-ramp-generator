# Hammer Surf Ramp Generator

A web-based tool for generating Hammer Editor prefabs (VMF files) with real-time 3D and 2D visualization.

## Features

- **Surf Ramp Generator**: Create parametric surf ramps with customizable:
  - Width, Height, Length
  - Curve (for curved ramps)
  - Two-sided/One-sided option
  - Segment count (for smooth curves)
  - Thickness
- **3D Visualization**: Real-time 3D preview using Three.js
- **2D Views**: Top, Front, and Side views like Hammer Editor
- **VMF Export**: Download generated prefabs as VMF files

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Usage

1. Adjust the parameters in the left sidebar
2. View the ramp in real-time in the 3D view and 2D projections
3. Click "Download VMF" to export the prefab
4. Import the VMF file into Hammer Editor

## License

MIT

