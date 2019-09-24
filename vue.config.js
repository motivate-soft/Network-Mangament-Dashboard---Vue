'use strict' 
const path = require('path');
const fs = require('fs');

module.exports = {
  devServer: {
    host: '0.0.0.0',
    hot: true,
    disableHostCheck: true,
    proxy: {
      "/api": {
        target: "http://63.33.123.175:8080"
      },
      "/ws": {
        target: "ws://63.33.123.175:8080"
      }
    },
    overlay:
    {
      errors: true,
      warnings: true
    },
  },
  css:
  {
    sourceMap: process.env.NODE_ENV === 'development',
    loaderOptions:
    {
      postcss:
      {
        config:
        {
          // without this Webpack complains that there is no PostCSS config inside the Vuetify/dist folder
          path: path.resolve(__dirname, '.postcssrc.js'),
        }
      }
    }
  },
  productionSourceMap: false,
  configureWebpack: config => {
    let parent, dir = path.resolve(__dirname);
    const parsed = path.parse(dir);
    while(parsed.root !== dir)
    {
      dir = path.dirname(dir);
      parent = dir + (parsed.root != dir ? path.sep : '') + 'node_modules';
      config.resolve.modules.push(parent);
      config.resolveLoader.modules.push(parent);
    }
    
    config.devtool = 'inline-source-map';
  },
  chainWebpack: config => {
    config.resolve.symlinks(true);
    if (config.plugins.store.get('prefetch')) {
      config
        .plugin('prefetch')
        .tap(args => {
          args[0].fileBlacklist = [
            /\.map$/,
            /pdfmake\.[^.]+\.js$/,
            /xlsx\.[^.]+\.js$/,
            /fabric[^.]*\.[^.]+\.js$/,
            /responsivedefaults\.[^.]+\.js$/,
          ];
          return args;
        });
    }
    if(process.env.NODE_ENV === 'production')
    {
      const zopfli = require("@gfx/zopfli");
      const compressionTest = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

      config.plugin('assetGzip').use(require("compression-webpack-plugin"),
      [{
        algorithm(input, compressionOptions, callback) 
        {
          return zopfli.gzip(input, compressionOptions, callback);
        },
        compressionOptions: 
        {
          numiterations: 15
        },
        minRatio: 0.99,
        test: compressionTest
      }]);
      config.plugin('assetBrotli').use(require("brotli-webpack-plugin"),
      [{
        test: compressionTest,
        minRatio: 0.99
      }]);      
    }
    return config;
  }
};
