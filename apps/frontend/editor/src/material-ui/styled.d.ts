import 'styled-components';
import { Theme } from '@mui/material/styles';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

declare module '@mui/material/styles' {
  interface Shape {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }
}
