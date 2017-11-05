var loader = require('awesome-typescript-loader')
module.exports = {
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  context: __dirname,

  output: {
    filename: 'bundle.js',
    library: 'Binder'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader', options: {
                    transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
                } }
    ]
  },
  plugins: [
        new loader.CheckerPlugin()
    ]
}
