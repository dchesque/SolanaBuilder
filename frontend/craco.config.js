// craco.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Desative a regra de fullySpecified para não exigir extensão em imports estritamente ESM
      webpackConfig.resolve.fullySpecified = false;

      // Exemplo de aliases
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      };

      // Fallbacks para módulos Node.js que algumas dependências exigem
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process'),
      };

      // Garante variáveis globais que muitos polyfills esperam
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    },
  },
};
