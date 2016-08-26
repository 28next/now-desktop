// Native
const path = require('path')

// Packages
const webpack = require('webpack')
const LiveReloadPlugin = require('webpack-livereload-plugin')

const outputPath = path.join(__dirname, 'app', 'dist')
const nodeEnv = process.env.NODE_ENV || 'development'

module.exports = [
  {
    name: 'react',
    entry: './src/react/index.js',
    output: {
      path: outputPath,
      filename: 'react.js'
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: [
              'react'
            ],
            plugins: [
              'transform-es2015-modules-commonjs'
            ]
          }
        },
        {
          test: /\.json/,
          loader: 'json'
        },
        {
          test: /\.svg$/,
          loader: 'raw-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(nodeEnv)
        }
      }),
      new LiveReloadPlugin()
    ]
  },
  {
    name: 'electron',
    entry: './src/electron/index.js',
    target: 'electron',
    output: {
      path: outputPath,
      filename: 'electron.js'
    },
    externals(context, request, callback) {
      callback(null, request.charAt(0) === '.' ? false : 'require("' + request + '")')
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            plugins: [
              'transform-es2015-modules-commonjs',
              'transform-async-to-generator'
            ]
          }
        },
        {
          test: /\.json/,
          loader: 'json'
        }
      ]
    }
  }
]
