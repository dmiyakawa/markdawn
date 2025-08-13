/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    'px-3',
    'py-1',
    'py-2',
    'min-h-6',
    'min-h-8',
    'min-h-12',
    'bg-gray-50',
    'border-gray-200',
    'rounded-t-lg',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
