module.exports = {
  theme: 'reco',
  themeConfig: {
    logo: '/img.jpg',
    type: 'blog',
    heroText: 'nihao',
    // 博客配置
    blogConfig: {
      category: {
        location: 2,     // 在导航栏菜单中所占的位置，默认2
        text: 'Category' // 默认文案 “分类”
      },
      tag: {
        location: 3,     // 在导航栏菜单中所占的位置，默认3
        text: 'Tag'      // 默认文案 “标签”
      }
    },
    nav: [
      { text: 'TimeLine', link: '/timeline/', icon: 'reco-date' }
    ],

    vssueConfig: {
      platform: 'github',
      owner: 'xanggang',
      repo: 'note-house-issues',
      clientId: 'fc43564cb98c393b9935',
      clientSecret: '451e6dd58866ca477d249313f8c6225cdc093067',
    }
  },
  configureWebpack: (config, isServer) => {
    if (!isServer) {
      return {
        devServer: {
          port: 9001,
          proxy: {
            '/': {
              target: 'http://47.96.139.86:9100',
              changeOrigin: true
            }
          }
        },
      }
    }
  }
}
