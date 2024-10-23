import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import CleanCss from "clean-css";

export default {
  input: "src/index.js",
  output: [
    // {
    //   file: "dist/bundle.js",
    //   format: "iife",
    //   plugins: [],
    // },
    {
      file: "dist/bundle.min.js",
      format: "iife",
      plugins: [terser()],
    },
  ],
  plugins: [
    del({ targets: "dist/*" }),
    nodeResolve(),
    copy({
      targets: [
        {
          src: "./public/quill.snow.css",
          dest: "dist",
          transform: (contents) => new CleanCss().minify(contents).styles,
        },
      ],
    }),
  ],
};
