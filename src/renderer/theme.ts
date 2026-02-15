import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        background: {
          body: '#0d1117',
          surface: '#161b22',
          level1: '#1c2128',
          level2: '#242a33',
          level3: '#2b323c',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          tertiary: '#6e7681',
        },
        divider: '#30363d',
      },
    },
  },
  fontFamily: {
    body: '"Inter", system-ui, -apple-system, sans-serif',
    display: '"Inter", system-ui, -apple-system, sans-serif',
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === 'solid' && {
            backgroundColor: theme.vars.palette.primary[500],
            color: '#ffffff',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary[600],
            },
          }),
          ...(ownerState.variant === 'soft' && {
            backgroundColor: 'rgba(76, 175, 80, 0.12)',
            color: theme.vars.palette.primary[300],
          }),
          ...(ownerState.variant === 'outlined' && {
            borderColor: theme.vars.palette.primary[500],
            color: theme.vars.palette.primary[400],
            '&:hover': {
              borderColor: theme.vars.palette.primary[400],
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
            },
          }),
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.secondary,
          '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.12)',
            color: theme.vars.palette.primary[400],
          },
        }),
      },
    },
    JoyStack: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.direction === 'column' && {
            backgroundColor: 'transparent',
          }),
        }),
      },
    },
    JoyTypography: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.primary,
        }),
      },
    },
    JoyAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.level1,
          border: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
  },
});

export default theme;
