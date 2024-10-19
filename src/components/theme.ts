import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    sizes: {
      title: number;
      subtitle: number;
      text: number;
    };
  }
  interface ThemeOptions {
    sizes?: {
      title?: number;
      subtitle?: number;
      text?: number;
    };
  }
}

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h6: {
      fontSize: '1.25rem',
    },
  },
  sizes: {
    title: 24,
    subtitle: 18,
    text: 16,
  },
});

export default theme;
