// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//     "./public/index.html"
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         'jersey': ['Inter', 'sans-serif'],
//         'normaltext': ['Inter', 'sans-serif'],
//       },
//       colors: {
//         'logocolor': '#3b82f6', // Adjust this to your brand color
//         'black': '#000000',
//         'gray': {
//           800: '#1f2937',
//           700: '#374151',
//           600: '#4b5563',
//           500: '#6b7280',
//           400: '#9ca3af',
//           300: '#d1d5db',
//         }
//       },
//       animation: {
//         'spin': 'spin 1s linear infinite',
//       }
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        jersey: ["Inter", "sans-serif"],
        normaltext: ["Inter", "sans-serif"],
      },
      colors: {
        logocolor: "#3b82f6", // brand color
        black: "#000000",
        gray: {
          800: "#1f2937",
          700: "#374151",
          600: "#4b5563",
          500: "#6b7280",
          400: "#9ca3af",
          300: "#d1d5db",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        spin: "spin 1s linear infinite",
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
