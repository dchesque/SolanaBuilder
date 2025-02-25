const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove any existing DefinePlugin for process.env
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => !(plugin instanceof webpack.DefinePlugin)
      );

      // Adiciona novo DefinePlugin com valores seguros
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({
            ...process.env,
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
          })
        })
      );

      // Configurações de fallback anteriores
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'),
        process: require.resolve('process/browser.js'),
        buffer: require.resolve('buffer/')
      };

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': 'process/browser.js'
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        }),
        new NodePolyfillPlugin()
      );

      return webpackConfig;
    }
  },
  eslint: {
    enable: false
  }
};