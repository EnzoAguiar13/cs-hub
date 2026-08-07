// @ts-check
import { baseConfig } from "@cs-hub/config/eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["eslint.config.mjs", "jest.config.js"] },
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./test/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
