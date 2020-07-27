module.exports = {
  theme: 'reco',
  themeConfig: {
    logo: '/logo.jpg',
    authorAvatar: '/logo.jpg',
    type: 'blog',
    heroText: 'lynn的书桌',
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

    author: 'lynn',
    huawei: true,

    vssueConfig: {
      platform: 'github',
      owner: 'xanggang',
      repo: 'note-house-issues',
      clientId: 'fc43564cb98c393b9935',
      clientSecret: '451e6dd58866ca477d249313f8c6225cdc093067',
    },

    record: '浙ICP备20027145号',
    recordLink: 'ICP 备案指向链接',
    // cyberSecurityRecord: '公安部备案文案',
    // cyberSecurityLink: '公安部备案指向链接',
    // 项目开始时间，只填写年份
    startYear: '2020',
  },

  configureWebpack: (config, isServer) => {
    if (!isServer) {
      return {
        devServer: {
          proxy: {
            '/': {
              target: 'http://api.lynn.cool',
              changeOrigin: true
            }
          }
        },
      }
    }
  }
}
