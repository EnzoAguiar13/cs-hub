// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** Base ESLint flat config shared by all apps/packages. Each consumer extends this array. */
export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  {
    ignores: ["dist/**", ".next/**", "coverage/**", "generated/**"],
  },
);

export default baseConfig;
