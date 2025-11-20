# SVG Pattern Assets

This folder contains SVG patterns used for background textures in the HuntHub Editor.

## Patterns

### Currently Used

- **geometric.svg** - Plus (+) symbol pattern creating a grid effect
  - Used in: DashboardHero (::after pseudo-element)
  - Size: 60x60px
  - Color: White (#FFFFFF)
  - Opacity: 0.08 (in component)
  - Purpose: Subtle map-like grid pattern overlay

- **noise.svg** - Fractal noise texture for parchment/paper effect
  - Used in: DashboardHero (::before pseudo-element)
  - Size: 100x100px
  - Opacity: 0.06 (in component)
  - Blend mode: multiply
  - Purpose: Adds texture to give a vintage map feel

### Alternative Patterns (Available for Experimentation)

- **map-grid.svg** - Clean coordinate grid lines
  - Size: 80x80px
  - Style: Thin white lines in grid pattern
  - Use case: Alternative to geometric pattern

- **compass.svg** - Compass rose with cardinal directions
  - Size: 100x100px
  - Style: Simple compass points with center circle
  - Use case: Navigation-themed background

- **topographic.svg** - Topographic contour lines
  - Size: 120x120px
  - Style: Curved lines mimicking elevation maps
  - Use case: Terrain/adventure theme

- **dotted-path.svg** - Scattered dots forming path
  - Size: 80x80px
  - Style: Diagonal pattern of dots
  - Use case: Treasure map trail effect

## Usage

Import patterns in styled-components:

\`\`\`typescript
import geometricSvg from '@/assets/patterns/geometric.svg';
import noiseSvg from '@/assets/patterns/noise.svg';

// In styled-component:
background-image: url(${geometricSvg});
background-size: 60px 60px;
\`\`\`

## Color Customization

All patterns use white (#FFFFFF) fill/stroke to ensure visibility on dark backgrounds. Adjust opacity in the component to control intensity.

## Notes

- All patterns are designed to tile seamlessly
- Optimized for background use with CSS repeat
- White color chosen for maximum contrast on bronze gradient