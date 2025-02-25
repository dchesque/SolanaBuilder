const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix for imports outside of src directory
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'),
        process: require.resolve('process/browser.js'),
        buffer: require.resolve('buffer/'),
        console: require.resolve('console-browserify'),
      };

      // Configure ModuleScopePlugin to allow imports outside of src
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(
        plugin => plugin.constructor.name === 'ModuleScopePlugin'
      );
      if (moduleScopePlugin) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          plugin => plugin.constructor.name !== 'ModuleScopePlugin'
        );
      }

      // Alias configuration
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': 'process/browser.js'
      };

      // Remove any existing DefinePlugin for process.env
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => !(plugin instanceof webpack.DefinePlugin)
      );

      // Add plugins
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        }),
        new NodePolyfillPlugin(),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({
            ...process.env,
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
          })
        })
      );

      return webpackConfig;
    }
  },
  eslint: {
    enable: false // Disable ESLint during build
  },
  babel: {
    plugins: [
      '@babel/plugin-transform-private-property-in-object',
    ]
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^console-browserify$': path.resolve(__dirname, 'node_modules/console-browserify')
      }
    }
  }
};