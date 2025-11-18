import 'styled-components';
import { Theme } from '@mui/material/styles';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }

  interface Shape {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    accent: true;
  }
}
