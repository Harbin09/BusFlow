module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: '#004ac6',
        'on-primary': '#ffffff',
        'primary-container': '#2563eb',
        'on-primary-container': '#eeefff',
        'primary-fixed': '#dbe1ff',
        'on-primary-fixed': '#00174b',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-fixed-variant': '#003ea8',

        // Secondary
        secondary: '#505f76',
        'on-secondary': '#ffffff',
        'secondary-container': '#d0e1fb',
        'on-secondary-container': '#54647a',
        'secondary-fixed': '#d3e4fe',
        'on-secondary-fixed': '#0b1c30',
        'secondary-fixed-dim': '#b7c8e1',
        'on-secondary-fixed-variant': '#38485d',

        // Tertiary
        tertiary: '#943700',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#bc4800',
        'on-tertiary-container': '#ffede6',
        'tertiary-fixed': '#ffdbcd',
        'on-tertiary-fixed': '#360f00',
        'tertiary-fixed-dim': '#ffb596',
        'on-tertiary-fixed-variant': '#7d2d00',

        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Surface
        background: '#f7f9fb',
        'on-background': '#191c1e',
        surface: '#f7f9fb',
        'on-surface': '#191c1e',
        'on-surface-variant': '#434655',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'surface-variant': '#e0e3e5',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'inverse-primary': '#b4c5ff',

        // Outline
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        'surface-tint': '#0053db',
      },

      spacing: {
        gutter: '24px',
        'container-max': '1440px',
        unit: '4px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
      },

      borderRadius: {
        card: '20px',
      },

      fontFamily: {
        'headline-lg': ['Inter'],
        'body-sm': ['Inter'],
        'body-lg': ['Inter'],
        'label-md': ['Inter'],
        'body-md': ['Inter'],
        'headline-md': ['Inter'],
        'headline-xl': ['Inter'],
      },

      fontSize: {
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      },

      keyframes: {
        'pulse-blue': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.3' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateX(400px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },

      animation: {
        'pulse-blue': 'pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        spin: 'spin 1s linear infinite',
      },

      boxShadow: {
        glass: '0 4px 12px rgba(37, 99, 235, 0.04)',
      },

      backdropBlur: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};
