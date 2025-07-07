// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Add paths to all your source files
    "./views/**/*.ejs", // Add paths to your EJS files
  ],
  theme: {
    extend: {
      colors: {
        customColor: "#F6F1EE",
      },
    },
  },
  plugins: [],
};
