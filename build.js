#!/usr/bin/env node
import { compile } from "./src";

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
