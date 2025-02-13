const webpack = require('webpack');

module.exports = function override(config) {
  // Adiciona alias para process/browser
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'process/browser': 'process/browser.js'
    },
    fallback: {
      ...config.resolve.fallback,
      process: require.resolve('process/browser'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      zlib: require.resolve('browserify-zlib'),
      url: require.resolve('url/'),
    }
  };

  // Adiciona plugins necessários
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.NormalModuleReplacementPlugin(
      /node:crypto/,
      'crypto-browserify'
    )
  ];

  return config;
}