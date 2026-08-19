import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
  },
});
