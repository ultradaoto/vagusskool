/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'light-gold': '#F4E4BC',
        'soft-white': '#FAF9F6',
        'dark-text': '#2C2C2C',
        'accent-purple': '#8A6F9D',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FAF9F6 0%, #F0E6FF 100%)',
        'golden-gradient': 'linear-gradient(45deg, #D4AF37, #F4E4BC)',
        'footer-gradient': 'linear-gradient(45deg, #8A6F9D, #7A5F8D)',
      },
      boxShadow: {
        'golden': '0 5px 15px rgba(212, 175, 55, 0.3)',
        'golden-hover': '0 8px 20px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'shimmer': 'shimmer 3s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(100%) rotate(45deg)' },
        }
      }
    },
  },
  plugins: [],
}
