const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development', // ou 'production', conforme seu ambiente
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // opcional: limpa a pasta 'dist' a cada build
  },
  resolve: {
    fallback: {
      'process/browser': require.resolve('process/browser'),
    },
  },
  plugins: [
    // Fornece a variável global "process" a partir de "process/browser"
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  // Outras configurações (loaders, devServer, etc.) podem ser adicionadas conforme necessário
};
