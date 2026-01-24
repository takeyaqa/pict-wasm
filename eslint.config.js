import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".emsdk", "dist"]),
  {
    files: ["wasm-src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, tseslint },
    extends: [
      "js/recommended",
      "tseslint/strictTypeChecked",
      "tseslint/stylisticTypeChecked",
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ["wasm-test/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, tseslint, vitest },
    extends: ["js/recommended", "tseslint/recommended", "vitest/recommended"],
  },
  eslintConfigPrettier,
]);
