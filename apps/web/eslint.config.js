const coreWebVitals = require("eslint-config-next/core-web-vitals")
const typescriptEslint = require("typescript-eslint")

module.exports = [
  {
    name: "capsulenote/ignores",
    ignores: ["**/.next/**", "**/dist/**", "**/coverage/**", "**/.turbo/**"],
  },
  ...coreWebVitals,
  {
    name: "capsulenote/typescript-overrides",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptEslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    name: "capsulenote/tests-overrides",
    files: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
      "playwright.config.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]
