import React from 'react';
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

  interface TypeBackground {
    default: string;
    defaultLight: string;
    paper: string;
    surface: string;
  }

  interface TypographyVariants {
    displayFontFamily: string;
    smRegular: React.CSSProperties;
    smMedium: React.CSSProperties;
    smBold: React.CSSProperties;
    xsRegular: React.CSSProperties;
    xsMedium: React.CSSProperties;
    xsBold: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    smRegular?: React.CSSProperties;
    smMedium?: React.CSSProperties;
    smBold?: React.CSSProperties;
    xsRegular?: React.CSSProperties;
    xsMedium?: React.CSSProperties;
    xsBold?: React.CSSProperties;
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
  interface ChipPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyOwnProps {
    textStyle?: 'display' | 'ui';
  }

  interface TypographyPropsVariantOverrides {
    smRegular: true;
    smMedium: true;
    smBold: true;
    xsRegular: true;
    xsMedium: true;
    xsBold: true;
  }
}

declare module 'styled-components' {
  import { Theme as MuiTheme } from '@mui/material/styles';
  export interface DefaultTheme extends MuiTheme {}
}
