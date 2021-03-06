const fs = require('fs')
const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const css = require('rollup-plugin-css-porter')
const { camelCase } = require('lodash')
const { name, dependencies } = require('../package.json')

const vue = require('rollup-plugin-vue2')

const base = path.resolve(__dirname, '..')
const src = path.resolve(base, 'src')
const dist = path.resolve(base, 'dist')


// Ensure dist directory exists
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist)
}

// Libs in `external` will not be bundled to dist,
// since they are expected to be provided later.
// We want to include some of them in the build, so we exclude it here.
const externalExcludes = [
  'popper.js',
  'lodash.startcase',
  'lodash.get',
  'vue-functional-data-merge',
  'axios',
  'element-ui'
]

const config = {
  input: path.resolve(src, 'index.js'),
  external: Object.keys(dependencies).filter(
    dep => externalExcludes.indexOf(dep) === -1
  ),
  plugins: [
    css(),
    vue(),
    resolve({
       extensions: ['.js', '.vue'],
       jsnext: true,
        browser: true,
   }),
    commonjs(),
    babel({
      plugins: ['external-helpers'],
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    })
  ],
  output: [
    {
      format: 'cjs',
      intro: 'const process = { env: { NODE_ENV: "production" } };',
      name: camelCase(name),
      file: path.resolve(dist, name + '.common.js'),
      sourcemap: true
    },
    {
      format: 'umd',
      intro: 'const process = { env: { NODE_ENV: "production" } };',
      name: camelCase(name),
      file: path.resolve(dist, name + '.js'),
      sourcemap: true
    }
  ]
}

module.exports = config
