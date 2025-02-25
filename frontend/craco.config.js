const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  eslint: {
    enable: false  // Desabilita completamente o ESLint durante o build
  },
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

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

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        }),
        new NodePolyfillPlugin(),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env)
        })
      ];

      return webpackConfig;
    }
  }
};