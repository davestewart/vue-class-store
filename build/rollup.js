// ------------------------------------------------------------------------------------------
// setup
// ------------------------------------------------------------------------------------------

import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import path from 'path'
import rimraf from 'rimraf'
import license from 'rollup-plugin-license'
import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'

const pkg = require('../package.json')
const pkgName = pkg.name
const className = pkgName.replace(/(^\w|-\w)/g, c => c.replace('-', '').toUpperCase())

function output (ext, format = 'umd') {
  return {
    name: className,
    file: `dist/${pkgName}.${ext}`,
    format: format,
    exports: 'named',
    globals: {
      vue: 'Vue',
    },
  }
}

// ------------------------------------------------------------------------------------------
// build
// ------------------------------------------------------------------------------------------

const umd = {
  input: 'src/index.ts',
  external: [
    'vue'
  ],
  output: output('js'),
  plugins: [
    resolve({
      extensions: ['.js', '.ts'],
    }),
    typescript({
      cacheRoot: `build/.rpt2_cache`,
    }),
    license({
      banner: {
        content: {
          file: path.join(__dirname, 'banner.txt'),
        },
      },
    }),
    commonjs(),
    buble(),
  ],
}

const min = Object.assign({}, umd, {
  output: output('min.js'),
  plugins: [...umd.plugins, uglify()],
})

const es = Object.assign({}, umd, {
  output: output('esm.js', 'es'),
})

rimraf.sync('dist')
export default process.env.NODE_ENV === 'production'
  ? [umd, es, min]
  : [umd, es]
