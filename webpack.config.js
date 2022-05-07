'use strict';
var webpack = require('webpack');
var path = require('path');
const HtmlWebpackPlugin    = require('html-webpack-plugin');

// Builds bundle usable inside <script>.
module.exports = {
  context: __dirname,
  mode: 'production',
  entry: {
    'app': './app.js',
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "app",
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        }
      }
    ]
  },
  resolve: {
    fallback: {
      util: require.resolve('util/')
    }
  },
  devServer: {
    contentBase: __dirname,
    publicPath: '/dist',
    compress: true,
    port: 3000,
  },
  optimization: {
    minimize: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
    }),
  ],
};
