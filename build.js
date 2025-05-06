#!/usr/bin/env node
import { compile } from "./lib/index.js";

await compile({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "dist",
  clean: true,
  options: {
    sourceMap: true,
    declaration: true,
  },
});
