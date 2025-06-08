const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: '$',           // library name for UMD
    libraryTarget: 'umd',   // output format UMD
    globalObject: 'this',   // fixes 'window' or 'self' issues in UMD
    libraryExport: 'default' // export default export
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production',
};
