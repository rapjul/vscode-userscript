const path = require('path');
const webpack = require('webpack');

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const webExtensionConfig = {
  mode: 'none', // This leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'webworker', // Extensions run in a webworker context
  entry: {
    webextension: './src/extension.ts', // Source of the web extension main file
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'test/suite/index.browser': './src/test/suite/index.browser.ts' // Source of the web extension test runner
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './out'),
    library: {
      type: 'commonjs'
    },
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // Look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'], // Support ts-files and js-files
    alias: {
      // Provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // See https://webpack.js.org/configuration/resolve/#resolvefallback
      //   for the list of Node.js core module polyfills.
      assert: require.resolve('assert')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: { configFile: 'browser.tsconfig.json' }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser' // Provide a shim for the global `process` variable
    })
  ],
  externals: {
    vscode: 'commonjs vscode' // Ignored because it doesn't exist
  },
  performance: {
    hints: false,
    maxAssetSize: 512000,
    maxEntrypointSize: 512000
  },
  devtool: 'nosources-source-map' // Create a source map that points to the original source file
};
module.exports = [webExtensionConfig];
