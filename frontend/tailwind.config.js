/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: "#1E1026",
          900: "#271535",
        },
        pink: {
          400: "#E75480",
          500: "#FF5E99",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      screens: {
        '2xl': '1536px',
      },
      maxWidth: {
        '2xl': '42rem',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".btn-gradient": {
          "@apply bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base font-bold py-2 px-8 rounded-md inline-flex items-center gap-2 shadow-sm hover:shadow-md transition duration-500 ease-in-out":
            {},
        },
        ".card-shadow": {
          "@apply bg-black/30 rounded-2xl p-6 shadow-lg border border-purple-700/40":
            {},
        },
        ".input-focus": {
          "@apply focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition":
            {},
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
