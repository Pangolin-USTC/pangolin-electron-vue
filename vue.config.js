const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        'win': {
          'target': 'zip'
        },
        'electronDownload': {
          'mirror': 'http://npm.taobao.org/mirrors/electron/'
        },
        'extraResources': [
          {'from': './src/data/', 'to': '../data'}
        ]
      }
    }
  }
})
