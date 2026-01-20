/**
 * Mantine Theme Configuration
 * 
 */

import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  primaryColor: 'orange',

  colors: {
    // Primary colors (Orange)
    orange: [
      '#FFF6F1', // 00
      '#F8DCCD', // 25
      '#F4C4AC', // 50
      '#EEA782', // 100
      '#E88A58', // 200
      '#E36C2F', // 300
      '#DD4F05', // 400 - Base primary
      '#B84204', // 500
      '#933503', // 600
      '#6F2803', // 700
      '#4A1A02', // 800
      '#2C1001', // 900
    ],

    // Gray colors
    gray: [
      '#F9F9F9', // 25
      '#E1E0E0', // 50
      '#CCCACA', // 100
      '#E1E0E0', // 50
      '#8F8B8B', // 300
      '#6C6969', // 400
      '#4D4B4B', // 500
      '#323131', // 600
      '#1F1E1E', // 700
      '#131212', // 800
      '#0B0A0A', // 900
    ],

    // Error colors (Red)
    red: [
      '#FFFBFA', // 25
      '#FEF3F2', // 50
      '#FEE4E2', // 100
      '#FECDCA', // 200
      '#FDA29B', // 300
      '#F97066', // 400
      '#F04438', // 500
      '#D92D20', // 600
      '#B42318', // 700
      '#912018', // 800
      '#7A271A', // 900
    ],

    // Success colors (Green) - extracted from Syetem Color.Success
    green: [
      '#F6FEF9', // 25
      '#ECFDF3', // 50
      '#D1FADF', // 100
      '#A6F4C5', // 200
      '#6CE9A6', // 300
      '#32D583', // 400
      '#12B76A', // 500
      '#039855', // 600
      '#027A48', // 700
      '#05603A', // 800
      '#054F31', // 900
    ],

    // Warning colors (Yellow) - extracted from Syetem Color.Warning
    yellow: [
      '#FFFCF5', // 25
      '#FFFAEB', // 50
      '#FEF0C7', // 100
      '#FEDF89', // 200
      '#FEC84B', // 300
      '#FDB022', // 400
      '#F79009', // 500
      '#DC6803', // 600
      '#B54708', // 700
      '#93370D', // 800
      '#7A2E0E', // 900
    ],

    // Dark Blue
    blue: [
      '#F5F8FF', // 25
      '#EFF4FF', // 50
      '#D1E0FF', // 100
      '#B2CCFF', // 200
      '#84ADFF', // 300
      '#528BFF', // 400
      '#2970FF', // 500
      '#155EEF', // 600
      '#004EEB', // 700
      '#0040C1', // 800
      '#00359E', // 900
    ],

    // Cyan - from Others.Cyan
    cyan: [
      '#F5FEFF', // 25
      '#ECFDFF', // 50
      '#CFF9FE', // 100
      '#A5F0FC', // 200
      '#67E3F9', // 300
      '#22CCEE', // 400
      '#06AED4', // 500
      '#088AB2', // 600
      '#0E7090', // 700
      '#155B75', // 800
      '#164C63', // 900
    ],

    // Teal
    teal: [
      '#F6FEFC', // 25
      '#F0FDF9', // 50
      '#CCFBEF', // 100
      '#99F6E0', // 200
      '#5FE9D0', // 300
      '#2ED3B7', // 400
      '#15B79E', // 500
      '#0E9384', // 600
      '#107569', // 700
      '#125D56', // 800
      '#134E48', // 900
    ],

    // Green Light
    lime: [
      '#FAFEF5', // 25
      '#F3FEE7', // 50
      '#E4FBCC', // 100
      '#D0F8AB', // 200
      '#A6EF67', // 300
      '#85E13A', // 400
      '#66C61C', // 500
      '#4CA30D', // 600
      '#3B7C0F', // 700
      '#326212', // 800
      '#2B5314', // 900
    ],

    // Purple
    violet: [
      '#FAFAFF', // 25
      '#F4F3FF', // 50
      '#EBE9FE', // 100
      '#D9D6FE', // 200
      '#BDB4FE', // 300
      '#9B8AFB', // 400
      '#7A5AF8', // 500
      '#6938EF', // 600
      '#5925DC', // 700
      '#4A1FB8', // 800
      '#3E1C96', // 900
    ],

    // Rose
    pink: [
      '#FFF5F6', // 25
      '#FFF1F3', // 50
      '#FFE4E8', // 100
      '#FECDD6', // 200
      '#FD6F8E', // 300
      '#FD6F8E', // 400
      '#F63D68', // 500
      '#E31B54', // 600
      '#C01048', // 700
      '#A11043', // 800
      '#89123E', // 900
    ],
  },

  // Default radius
  defaultRadius: 'md',

  // Font family
  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  fontFamilyMonospace: 'var(--font-geist-mono), monospace',

  // Headings
  headings: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },

  // Other theme settings
  white: '#FFFFFF',
  black: '#0C090D',

  // Default colors for components
  defaultGradient: {
    from: '#DD4F05', // primary-400
    to: '#933503',   // primary-600
    deg: 45,
  },

  // Component-specific styling
  components: {
    TextInput: {
      defaultProps: {
        styles: {
          input: {
            borderColor: '#CCCACA',
            backgroundColor: '#FFFFFF',
            color: '#1F1E1E',
            '&::placeholder': {
              color: '#8F8B8B',
            },
            '&:disabled': {
              backgroundColor: '#F9F9F9',
            },
          },
          label: {
            color: '#6C6969',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        styles: {
          input: {
            backgroundColor: '#FFFFFF',
            color: '#1F1E1E',
            '&::placeholder': {
              color: '#8F8B8B',
            },
            '&:disabled': {
              backgroundColor: '#F9F9F9',
            },
          },
          label: {
            color: '#6C6969',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        styles: {
          input: {
            backgroundColor: '#FFFFFF',
            color: '#1F1E1E',
            '&::placeholder': {
              color: '#8F8B8B',
            },
            '&:disabled': {
              backgroundColor: '#F9F9F9',
            },
          },
          label: {
            color: '#6C6969',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        styles: {
          root: {
            borderColor: '#E1E0E0',
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
  },
});
