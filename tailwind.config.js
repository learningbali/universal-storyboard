/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Menambahkan opsi font serif sinematik jika browser mendukung
        serif: ['Georgia', 'ui-serif', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};
