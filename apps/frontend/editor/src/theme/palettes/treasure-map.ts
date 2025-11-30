import { ThemeOptions } from '@mui/material';
import { createFocusRing } from '@/utils/getColor/colorUtils';

export const treasureMapPaletteConfig = {
  mode: 'light' as const,
  common: {
    black: '#2C1810',
    white: '#FFFFFF',
  },
  primary: {
    main: '#B6591B',
    dark: '#903300',
    light: 'rgba(182, 89, 27, 0.1)',
    // complementary: '#1B78B6',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#8b4513',
    dark: '#651f00',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4a6841',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#d32f2f',
    contrastText: '#FFFFFF',
  },
  accent: {
    light: '#c17a3a',
    main: '#d4af35',
    medium: '#a8651f',
    dark: '#b8941f',
    contrastText: '#2C1810',
  },
  background: {
    default: '#E4D5C1',
    defaultLight: '#EFE4D7',
    paper: '#f5f1e8',
    surface: '#FFFBF5',
  },
  text: {
    primary: '#2C1810',
    secondary: '#5D4E37',
    disabled: '#8B7355',
  },
  divider: '#D4A574',
  grey: {
    50: '#F5EFE6',
    100: '#E4D5C1',
    200: '#D4C4B0',
    300: '#D4A574',
    400: '#8B7355',
    500: '#5D4E37',
    600: '#8B6F47',
    700: '#2C1810',
    800: '#1F110A',
    900: '#120A06',
  },
} as const;

const treasureMapPalette = {
  palette: treasureMapPaletteConfig,
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    displayFontFamily: 'Georgia, "Times New Roman", serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: 40,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 32,
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 28,
      fontWeight: 600,
      lineHeight: 1.43,
    },
    h4: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.33,
    },
    h5: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none' as const,
    },
    smRegular: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.43,
    },
    smMedium: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
    },
    smBold: {
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.43,
    },
    xsRegular: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.33,
    },
    xsMedium: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.33,
    },
    xsBold: {
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.33,
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.33,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    displayH4: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.33,
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
    displayH6: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.5,
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
    displayBody2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.43,
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  shadows: [
    'none',
    '0 2px 4px rgba(44, 24, 16, 0.06)',
    '0 4px 8px rgba(44, 24, 16, 0.06)',
    '0 8px 16px rgba(44, 24, 16, 0.08)',
    '0 12px 24px rgba(44, 24, 16, 0.08)',
    '0 16px 32px rgba(44, 24, 16, 0.10)',
    '0 20px 40px rgba(44, 24, 16, 0.10)',
    '0 24px 48px rgba(44, 24, 16, 0.12)',
    '0 8px 32px rgba(44, 24, 16, 0.3)',
    // Focus ring shadows (9-11) - derived from palette
    createFocusRing(treasureMapPaletteConfig.primary.main),
    createFocusRing(treasureMapPaletteConfig.error.main),
    createFocusRing(treasureMapPaletteConfig.success.main),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  shape: {
    borderRadius: 8,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1264,
    },
  },
} as ThemeOptions;

export default treasureMapPalette;
