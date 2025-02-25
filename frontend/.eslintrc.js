module.exports = {
    extends: [
      "react-app",
      "react-app/jest"
    ],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  };