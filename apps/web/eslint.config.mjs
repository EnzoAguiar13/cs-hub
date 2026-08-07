// @ts-check
import { baseConfig } from "@cs-hub/config/eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", ".next/**", "next-env.d.ts"] },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Next's <Link>/App Router patterns and shadcn-style components rely on this being off.
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
