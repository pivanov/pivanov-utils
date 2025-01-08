import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

const banner = `/*!
 * @pivanov/utils v${process.env.npm_package_version}
 * (c) 2024-present Pavel Ivanov
 * Released under the MIT License.
 * https://github.com/pivanov/utils
 */
`;

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: false,
        banner,
        plugins: [
          terser({
            format: {
              comments: /^!/,
            },
          }),
        ],
      },
      {
        file: 'dist/esm/index.js',
        format: 'es',
        sourcemap: false,
        banner,
        plugins: [
          terser({
            format: {
              comments: /^!/,
            },
          }),
        ],
      },
    ],
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false,
        jsx: 'react-jsx',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
        banner,
      },
    ],
    plugins: [dts()],
  },
];
