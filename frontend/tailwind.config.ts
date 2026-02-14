import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern Medical Design - Inspired by reference
        background: {
          DEFAULT: '#E8F2FF',      // Very light blue with waves
          card: '#FFFFFF',         // Pure white cards
          secondary: '#F0F7FF',    // Lighter blue for secondary
        },
        primary: {
          DEFAULT: '#5B9FED',      // Main blue (buttons, accents)
          light: '#A8D5FF',        // Light blue for gradients start
          dark: '#3B7FD4',         // Darker blue for gradients end
        },
        accent: {
          DEFAULT: '#5B9FED',      // Blue accent (same as primary)
          light: '#A8D5FF',        // Light blue
          dark: '#3B7FD4',         // Darker blue for hover
        },
        deepBlue: {
          DEFAULT: '#1A3B5D',      // Deep Blue for active icons
          muted: 'rgba(26, 59, 93, 0.25)', // Inactive icons
        },
        text: {
          primary: '#2D3748',      // Dark gray (main text)
          secondary: '#4A5568',    // Medium gray (secondary text)
          muted: '#A0AEC0',        // Light gray (muted text)
        },
        badge: {
          green: '#B8E86F',        // AI Active badge
          greenBg: '#E8F5E9',      // Badge background
        },
      },
      darkMode: 'class',
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      fontSize: {
        'display-hero': ['42px', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '300' }],
        'micro': ['10px', { lineHeight: '1.4', fontWeight: '700' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },
      backdropBlur: {
        'glass': '15px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 12px rgba(91, 159, 237, 0.3)',
        'nav': '0 -2px 10px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'breathing': 'breathing 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(199, 230, 90, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(199, 230, 90, 0.4)' },
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

