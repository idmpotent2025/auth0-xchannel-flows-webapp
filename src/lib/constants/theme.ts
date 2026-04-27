export const THEME = {
  branding: {
    name: 'Identity Architect Demo',
    primaryColor: '#003057', // Navy
    accentColor: '#0055A6',  // Blue
    backgroundColor: '#3A7D7D' // Teal
  },
  colors: {
    primary: {
      DEFAULT: '#003057',
      50: '#E6EBF0',
      100: '#CCD7E1',
      200: '#99AFC3',
      300: '#6687A5',
      400: '#335F87',
      500: '#003057',
      600: '#002646',
      700: '#001D35',
      800: '#001323',
      900: '#000A12',
    },
    accent: {
      DEFAULT: '#0055A6',
      50: '#E6F0F9',
      100: '#CCE1F3',
      200: '#99C3E7',
      300: '#66A5DB',
      400: '#3387CF',
      500: '#0055A6',
      600: '#004485',
      700: '#003364',
      800: '#002243',
      900: '#001122',
    },
    background: {
      DEFAULT: '#3A7D7D',
      50: '#EBF3F3',
      100: '#D7E7E7',
      200: '#AFCFCF',
      300: '#87B7B7',
      400: '#5F9F9F',
      500: '#3A7D7D',
      600: '#2E6464',
      700: '#234B4B',
      800: '#173232',
      900: '#0C1919',
    },
  }
} as const;

export type ThemeColors = typeof THEME.colors;
