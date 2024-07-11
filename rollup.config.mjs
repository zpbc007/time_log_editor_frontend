import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/bundle.js",
      format: "iife",
    },
    {
      file: "dist/bundle.min.js",
      format: "iife",
      plugins: [terser()],
    },
  ],
  plugins: [del({ targets: "dist/*" }), nodeResolve()],
};
