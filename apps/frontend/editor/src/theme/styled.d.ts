import 'styled-components';
import { Theme } from '@mui/material/styles';

// Extend styled-components DefaultTheme to include MUI theme
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
