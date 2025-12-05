/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Medical theme color palette
                primary: {
                    50: '#e6f7ff',
                    100: '#bae7ff',
                    200: '#91d5ff',
                    300: '#69c0ff',
                    400: '#40a9ff',
                    500: '#1890ff',
                    600: '#096dd9',
                    700: '#0050b3',
                    800: '#003a8c',
                    900: '#002766',
                },
                medical: {
                    teal: {
                        50: '#e6fffb',
                        100: '#b5f5ec',
                        200: '#87e8de',
                        300: '#5cdbd3',
                        400: '#36cfc9',
                        500: '#13c2c2',
                        600: '#08979c',
                        700: '#006d75',
                        800: '#00474f',
                        900: '#002329',
                    },
                    green: {
                        50: '#f6ffed',
                        100: '#d9f7be',
                        200: '#b7eb8f',
                        300: '#95de64',
                        400: '#73d13d',
                        500: '#52c41a',
                        600: '#389e0d',
                        700: '#237804',
                        800: '#135200',
                        900: '#092b00',
                    },
                },
                accent: {
                    purple: '#722ed1',
                    pink: '#eb2f96',
                    orange: '#fa8c16',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'medical': '0 4px 12px rgba(24, 144, 255, 0.15)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
