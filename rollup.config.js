import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: "json" }

export default {
  input: "./src/index.js",
  external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.devDependencies)),
  output: [{
    file: "./dist/openai-self.esm.js",
    format: "es",
    name: 'openai-self-esm'
  }, {
    file: "./dist/openai-self.cjs.js",
    format: "cjs",
    name: 'openai-self-cjs'
  }],
  plugins: [
    commonjs(),
    json(),
    resolve({
      preferBuiltins: true
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**']  // 排除node_module下的所有文件
    })
  ],
};