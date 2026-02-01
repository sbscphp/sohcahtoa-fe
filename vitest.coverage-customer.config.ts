import { defineConfig } from "vitest/config";
import base from "./vitest.config";

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/(customer)/**/*.ts", "app/(customer)/**/*.tsx"],
      exclude: [
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "node_modules/",
        ".next/",
        "**/*.config.*",
        "**/types/**",
      ],
    },
  },
});
