const CompressionPlugin = require('compression-webpack-plugin')
const SpritePlugin = require('./svg-sprite.js')

module.exports = {
  lintOnSave: 'warning',
  publicPath: process.env.NODE_ENV === 'production' ? '/user/' : '/',
  assetsDir: 'static',
  configureWebpack: {
    plugins: [
      new CompressionPlugin(),
      new SpritePlugin({ path: './icons' })
    ]
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()

    config.module
      .rule('svg')

      .oneOf('inline-svg')
        .resourceQuery(/inline/)
        .use('babel')
          .loader('babel-loader')
          .end()
        .use('vue-svg-loader')
          .loader('vue-svg-loader')
          .end()
        .end()

      .oneOf('other')
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: 'static/img/[name].[hash:8].[ext]'
          })
          .end()
        .end()
  },
  devServer: {
    proxy: {
      '^/ws': {
        target: 'ws://localhost',
        ws: true
      },
      '^/api': {
        target: 'http://localhost'
      }
    }
  }
}
