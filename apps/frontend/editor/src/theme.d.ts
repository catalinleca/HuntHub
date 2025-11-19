import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Shape {
    borderRadius: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }

  interface ShapeOptions {
    borderRadius?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }

  interface PaletteColor {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
    medium?: string;
  }

  interface SimplePaletteColorOptions {
    light?: string;
    main: string;
    dark?: string;
    contrastText?: string;
    medium?: string;
  }

  interface Palette {
    accent: PaletteColor;
  }

  interface PaletteOptions {
    accent?: SimplePaletteColorOptions;
  }

  interface TypographyVariants {
    displayFontFamily: string;
  }

  interface TypographyVariantsOptions {
    displayFontFamily?: string;
  }

  interface Theme {
    shape: Shape;
  }

  interface ThemeOptions {
    shape?: ShapeOptions;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Chip' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyProps {
    textStyle?: 'display' | 'ui';
  }
}

declare module 'styled-components' {
  import { Theme as MuiTheme } from '@mui/material/styles';
  export interface DefaultTheme extends MuiTheme {}
}