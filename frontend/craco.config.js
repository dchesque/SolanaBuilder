const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin para permitir imports fora de src
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // Substitui todos os imports de process/browser por process/browser.js
      webpackConfig.module.rules.push({
        test: /[\\/]node_modules[\\/].*axios[\\/].*\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'process/browser',
          replace: 'process/browser.js',
        },
      });

      // Configurações de fallback
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

      // Adiciona alias específico para o process/browser
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': 'process/browser.js'
      };

      // Adiciona plugins
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