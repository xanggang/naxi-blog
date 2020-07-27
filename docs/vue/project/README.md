---
title: 从零开始搭建一个企业级vue脚手架
date: 2020-07-22
categories:
 - vue
tags:
 - 脚手架
---

### 前言

vue-cli是一个非常优秀的脚手架模板，它可以轻松的创建新的应用程序而且可用于自动生成vue和webpack的项目模板， 而且可以自定义支持ts、less、sass、eslint等工具的配置。 那为什么我们还要再封装一层呢， 原因很简单， vue-cli做的还不够。 在面对企业级业务， 在同一个公司需要同时开发多个项目时， 我们需要更傻瓜的操作、更严格的规范、更便利的工具来保证多个项目间的代码风格统一。在这里我们用`vue-cli@4.4.6`为基础搭建一个企业级的脚手架项目。

### 基础部分
先用`vue-cli`来启动一个基础的vue项目
运行 `vue create mini-app`， 选择`Manually select features`, 后面的详细配置选择1、4、5、6、7、8
```
 (*) Babel // 使用babel编译
 ( ) TypeScript // 使用ts
 ( ) Progressive Web App (PWA) Support // 添加PWA
 (*) Router // vue-router
 (*) Vuex // vuex
 (*) CSS Pre-processors // less sass
 (*) Linter / Formatter // 代码风格、格式校验
 ( ) Unit Testing // 单元测试
 ( ) E2E Testing
```
后续的选择
``` 
? Please pick a preset: Manually select features
? Check the features needed for your project: Babel, Router, Vuex, CSS Pre-processors, Linter, Unit
? Use history mode for router? (Requires proper server setup for index fallback in production) Yes
? Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default): Sass/SCSS (with node-sass)
? Pick a linter / formatter config: Standard
? Pick additional lint features: Lint and fix on commit // 在commit的时候校验eslint
? Pick a unit testing solution: Mocha // 使用Mocha进行单元测试
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? No
```
一路下来之后再`install` 这样一个基本的架子就搭好了。

### 代码风格定制
在刚才的命令中， 已经默认加入了eslint的校验， 这里我们在根据情况， 定制一下具体的规则
这份文件需要额外安装`eslint-plugin-attributes eslint-plugin-vue`两个库
::: details .eslintrc.js配置
```js
module.exports = {
  "root": true,
  // 指定脚本的运行环境
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true,
  },
  "extends": [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  // 指定解析器选项
  "parserOptions": {
    "parser": "babel-eslint",
    // 启用ES6语法支持
    "ecmaVersion": 2015,
    // module表示ECMAScript模块
    "sourceType": "module"
  },
  "plugins": [
    "vue",
    "attributes"
  ],
  // 脚本在执行期间访问的额外的全局变量
  "globals": {
    "Vue": true,
    "VueRouter": true,
    "_": true // lodash
  },
  // 启用的规则及其各自的错误级别
  "rules": {
    "array-bracket-spacing": 2, // 强制数组方括号中使用一致的空格
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0, // 生产环境禁止打印
    "indent": [2, 2, { 'SwitchCase': 1 }], // 两个空格缩进
    "brace-style": [2, "1tbs"], // if else 的花括号换行规则
    "block-spacing": 2, // 代码块中开括号前和闭括号后有空格
    "eqeqeq": [2, "always", { "null": "ignore" }], // 必须使用 === 和 !== ，和 null 对比时除外
    "eol-last": 2, // 要求文件末尾存在空行
    "lines-around-comment": 0, // 要求在注释周围有空行
    "no-multiple-empty-lines": [2, { // 禁止出现多行空行
      max: 3, // 文件内最多连续 3 个
      maxEOF: 1, // 文件末尾最多连续 1 个
      maxBOF: 1 // 文件头最多连续 1 个
    }],
    "multiline-ternary": [2, "always-multiline"], // 如果表达式跨越多个行，则在三元表达式的操作数之间强制换行
    "no-trailing-spaces": [2, { // 禁止行尾空格
      "skipBlankLines": true, // 不检查空行
      "ignoreComments": true // 不检查注释
    }],
    "key-spacing": 2, // 象键值对值之前留有空格
    "camelcase": 0, // 骆峰命名法
    "new-cap": 2, // 构造函数首字母大写
    "spaced-comment": [2, "always", { // 注释的斜线和星号后要加空格
      "block": {
        exceptions: ["*"],
        balanced: true
      }
    }],
    "no-var": 2, // 禁止使用 var，必须用 let 或 const
    "no-unused-vars": [2, // 禁止定义不使用的变量
      {
        "vars": "all", // 变量定义必须被使用
        "args": "none", // 对于函数形参不检测
        "ignoreRestSiblings": true, // 忽略剩余子项 fn(...args)，{a, b, ...coords}
        "caughtErrors": "none", // 忽略 catch 语句的参数使用
      }
    ],
    "no-use-before-define": [2, // 禁止在变量被定义之前使用它
      {
        "functions": false, // 允许函数在定义之前被调用
        "classes": false, // 允许类在定义之前被引用
      }
    ],
    "no-undef-init": 2, // 禁止将 undefined 赋值给变量
    "no-undef": 2, // 禁止访问未定义的变量或方法
    "no-sparse-arrays": 2, // 禁止数组中出现连续逗号
    "no-return-assign": 2, // 禁止在return中赋值
    "no-return-await": 2, // 禁止在 return 中使用 await
    "no-redeclare": 2, // 禁止重复声明
    "no-regex-spaces": 2, // 禁止在正则表达式中出现连续空格
    "no-multi-assign": 2, // 禁止连等赋值
    "no-multi-spaces": 2, // 禁止使用连续的空格
    "no-mixed-operators": [2, { // 禁止使用混合的逻辑判断，必须把不同的逻辑用圆括号括起来
      "groups": [
        ["&&", "||"]
      ]
    }],
    "no-mixed-requires": 2, // 相同类型的 require 必须放在一起
    "no-mixed-spaces-and-tabs": 2,// 禁止混用空格和 tab 来做缩进，必须统一
    "no-lone-blocks": 2, // 禁止使用无效的块作用域
    "no-extra-semi": 2, // 禁止额外的分号
    "no-eval": 2, // 禁止使用 eval
    "no-empty-function": 2, // 禁止空的 function, 包含注释的情况下允许
    "no-empty-pattern": 2, // 禁止解构中出现空 {} 或 []
    "no-empty": [2, { "allowEmptyCatch": true }], // 禁止出现空代码块
    "no-dupe-keys": 2, // 禁止对象出现重名键值
    "no-dupe-class-members": 2, // 类方法禁止重名
    "no-duplicate-case": 2, // 禁止 switch 中出现相同的 case\
    "no-duplicate-imports": 2, // 禁止重复 import
    "keyword-spacing": 2,// 关键字前后必须有空格
    "vue/script-indent": ["error", 2, { // script缩进配置
      "baseIndent": 0,
      "ignores": ["SwitchCase"]
    }],
    "vue/html-closing-bracket-newline": ["error", { // html右括号的位置，多行标签换行
      "singleline": "never",
      "multiline": "always"
    }],
    "vue/html-indent": ["error", 2, {
      "attribute": 1 // 属性的缩进倍数
    }],
    "vue/html-quotes": [ "error", "double" ], // HTML属性的双引号样式
    "vue/max-attributes-per-line": ["error", {
      "singleline": 3, // 单行超过3个属性，则换行
      "multiline": {
        "max": 1 // 多行最多只允许1个属性
      }
    }],
    "vue/multiline-html-element-content-newline": ["error", { // 多行元素的内容之前和之后执行换行
      "ignoreWhenEmpty": true,
      "allowEmptyLines": false
    }],
    "vue/mustache-interpolation-spacing":  ["error", "always"], //插值统一间距
    "vue/order-in-components": [0, {
      "order": [
        "el",
        "name",
        "parent",
        "functional",
        ["delimiters", "comments"],
        ["components", "directives", "filters"],
        "extends",
        "mixins",
        "inheritAttrs",
        "model",
        ["props", "propsData"],
        "fetch",
        "asyncData",
        "data",
        "computed",
        "watch",
        "LIFECYCLE_HOOKS",
        "methods",
        "head",
        ["template", "render"],
        "renderError"
      ]
    }],
    "vue/space-infix-ops": ["error", { "int32Hint": false }], // 缀操作符之间的间距
    "no-console": ["error", { allow: ["warn", "error"] }],
    // 最多允许的属性数量，单个属性的字符串最大长度
    "attributes/max-attributes": [0, { "max": 3, "attrStrLimit": 50 }],
    // 属性上'||'和'&&'出现的次数限制
    "attributes/max-attribute-value-logical": [2, { "max": 2 }],
  }
}
```
:::
### vuex
vuex的作用不多说， 我们这里的封装只限于启用模块化和命名空间， 然后处理一下部分全局的状态

::: details globalModule 全局的loading管理，使用命名空间
```js store/module/globalModule
const stack = []
const globalModule = {
  namespaced: true, // 启用命名空间
  state: {
    loading: false,
  },
  mutations: {
    SET_LOADING (state, bool) {
      state.loading = bool
    }
  },
  actions: {
    // 在同事触发多个loading的时候， 只有最后一个响应结束后在触发loading效果
    changeLoading({ commit, state }, boolean) {
      if (boolean) {
        stack.push(true)
        if (!state.loading) {
          commit('SET_LOADING', true)
        }
      } else {
        stack.unshift()
        if (!stack.length) {
          commit('SET_LOADING', false)
        }
      }
    },
    closeAllLoading({ commit }) {
      commit('SET_LOADING', false)
      stack.length = 0
    },
    // 如果不用上面的方法的话
    changeLoading1({ commit }, boolean) {
      commit('SET_LOADING', boolean)
    } 
  }
}

export default globalModule
```
:::

::: details store/storage 订阅store 将vuex里的数据缓存到本地
```js store/storage
/**
 * @description state在本地缓存中的操作
 */

import store from './index'

/**
 * @description 初始化localStorage
 */
function _initLocalFun (type) {
  let state = ''
  try {
    state = JSON.parse(localStorage.getItem(type))
  } catch (error) {
    state = localStorage.getItem(type)
  }
  state && store.commit(type, state)
}

// 需要缓存在local的Mutation
const localMutationTypes = []

/**
 * @description 从缓存中初始化 state
 */
export function initStateFromStorage () {
  localMutationTypes.forEach(item => {
    _initLocalFun(item)
  })
}

/**
 * @description 清除session缓存
 */
export function removeSession () {
  localMutationTypes.forEach(item => {
    sessionStorage.removeItem(item)
  })
}

/**
 * @description 清除local缓存
 */
export function removeLocal () {
  localMutationTypes.forEach(item => {
    localStorage.removeItem(item)
  })
}

```
:::

::: details store/index
```js store/index
import Vue from 'vue'
import Vuex from 'vuex'
import globalModule from './module/globalModule'
import { initStateFromStorage } from './'
Vue.use(Vuex)

/**
 * @description 订阅mutation，并将state缓存到本地
 * @param {*} store
 */
const storagePlugin = store => {
  store.subscribe(mutation => {
    localStorage.setItem(mutation.type, JSON.stringify(mutation.payload))
  })
}


export default new Vuex.Store({
  namespace: true,
  state: {},
  mutations: {},
  actions: {},
  modules: {
    globalModule
  },
  plugins: [storagePlugin]
})
 // 
 initStateFromStorage()
```
:::

### 添加UI库
这里我们选择了`element-ui`, ` vue add element`。通过element提供的插件直接安装，在命令行可以根据需求选择全量安装和是否使用`sass`来覆盖
element主题样式。 通过修改`element-variables.sass`可以实现主题的定制。这里我们选择来全量安装，因为后面会用到webpack。

### 添加环境变量
vue-cli内置了很方便的环境变量配置， 简单的设置就可以实现
在根目录添加`.env.development`和`.env.production`文件, 
加入你需要的环境变量内容， 注意要使用`VUE_APP_BASE_URL = value`的格式
```
VUE_APP_SERVER_MODE = dev
VUE_APP_BASE_URL = 'http://dev.a.com'
```
然后在项目内就可以使用`process.env.VUE_APP_BASE_URL`来使用对应的环境变量， 

### 添加axios
作为目前最受欢迎的请求库，axios我们也要封装一下`npm i axios -S`, 内部的封装内容和项目需求相关度很高，
概括一下就好了
::: details 第一层封装
```js
import axios from 'axios'
import store from '../store'
import { Message } from 'element-ui'
import { removeSession } from '../store/storage'

// axios 配置
axios.defaults.timeout = 60000
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.baseURL = process.env.VUE_APP_API_HOST

// 对响应数据进行处理
axios.interceptors.response.use(function (response) {
  setTimeout(() => store.dispatch('changeLoading', false), 300)
}, function (error) {
  setTimeout(() => store.dispatch('changeLoading', false), 300)
  let message = error.message
  let code = 0
  // 由后端返回的错误信息
  if (error.response && error.response.data) {
    const resError = error.response.data
    message = resError.error_msg
    code = resError.error_code
  }
  // 这里可以根据和后端约定的错误码来判断是否展示接口错误提示
  Message.warning(message)
  // 4011 未登录或登录状态失效
  switch (code) {
    // 退出登陆逻辑
    case 4001:
      removeSession()
      return false
    case 0:
      // 接口连接超时
      break
    default:
  }
  return Promise.reject(error)
})

// 设置请求头信息
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
export default axios

```
:::

::: details 第二层封装
```js
import axios from './axios'
import store from '../store'


const request = async (method, url, data, {
  globalLoading = true,
  ...options
}) => {
  globalLoading && store.dispatch('changeLoading', true)
  return axios({ method, url, data, ...options })
}

export default {
  async get (url, options = {}) {
    return request('get', url, {}, options)
  },
  async post (url, data = {}, options = {}) {
    return request('post', url, data, options)
  },
  async put (url, data = {}, options = {}) {
    return request('put', url, data, options)
  }
}

```
:::

### webpack优化
#### DllPlugin（动态链接库）
项目中依赖的一些第三方包比如react、vue一般情况下包的内容不会发生改变，而每一次打包都要对它们进行构建显然是不合理的，这会很浪费性能。正确的做法应该是将这些第三方包只打包一次，之后直接引用就可以，直到第三方包需要更新版本时再重新进行构建。这样我们在打包的时候只需要构建我们的业务代码即可。
Dllplugin插件可以帮助我们把这些不做修改的包抽取为动态链接库，并且会生成一个名为manifest.json的文件，这个文件是用来让DLLReferencePlugin映射到相关的依赖上去的。

> 来源：掘金 liupl https://juejin.im/post/5d68d6b0e51d4561a60d9e1c

##### 首先创建一个用于抽取dll的webpack配置
安装`webpack-cli`和`clean-webpack-plugin`这两个库。
然后在加入`"build-dll": "webpack -p --progress --config ./webpack.dll.config.js",`
::: details webpack.dll.config.js
```js
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// dll文件存放的目录(建议存放到public中)
const dllPath = './public/vendor'

module.exports = {
  entry: {
    // 将公共库预先打包
    vendor: [
      'axios',
      'vuex',
      'vue-router',
      'element-ui'
    ]
  },
  output: {
    filename: '[name]_[hash:6].dll.js',
    path: path.resolve(__dirname, dllPath),
    library: '[name]_[hash]'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      // manifest 用于映射
      path: path.join(__dirname, dllPath, '[name].manifest.json'),
      context: process.cwd()
    })
  ]
}

```
:::

运行`build-dll`命令， 可以看到在`public`文件夹下生成了vendor文件和`vendor.manifest.json`文件。

##### 编辑`vue.config.js`文件
在`vue.config.js`中加入
```js
const webpack = require('webpack')
module.exports = {
  lintOnSave: true, // eslint 错误处理，true表示对待eslint错误为warning，warning不会导致编译失败
  configureWebpack: config => {
    return {
      plugins: [
        // dll插件加入
        new webpack.DllReferencePlugin({
          context: process.cwd(),
          manifest: require('./public/vendor/vendor.manifest.json')
        })
      ]
    }
  },
}
```
##### 安装`add-asset-html-webpack-plugin`
由于[name]_dll文件生成之后，并没有动态的引入进去，所以需要一个插件可以动态的将生成的dll文件引入,
`npm i -D add-asset-html-webpack-plugin`
在`vue.config.js`中加入
```js
const webpack = require('webpack')
const path = require('path')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
module.exports = {
  lintOnSave: true, // eslint 错误处理，true表示对待eslint错误为warning，warning不会导致编译失败
  configureWebpack: config => {
    return {
      plugins: [
        // dll插件加入
        new webpack.DllReferencePlugin({
          context: process.cwd(),
          manifest: require('./public/vendor/vendor.manifest.json')
        }),
        new AddAssetHtmlWebpackPlugin({
          // dll文件位置
          filepath: path.resolve(__dirname, './public/vendor/*.js'),
          // dll 引用路径
          publicPath: './vendor',
          // dll最终输出的目录
          outputPath: './vendor'
        })
      ]
    }
  }
}

```

### 使用`commitlint`规范团队的git提交信息
在一个团队中，每个人的git的commit信息都不一样，五花八门，没有一个机制很难保证规范化，如何才能规范化呢？
可能你想到的是git的hook机制，去写shell脚本去实现。这当然可以，其实JavaScript有一个很好的工具可以实现这个模板，它就是commitlint。
一般情况下，commitlint会用在git的hook回调中，最简单的就是和 husky一起使用
运行`vue add commitlint` 它是vue-cli的官方插件，封装了 `commitizen commitlint conventional-changelog-cli husky`，一键安装，
开箱即用。文档参考`http://developer.aliyun.com/mirror/npm/package/vue-cli-plugin-commitlint/v/1.0.11`。

安装会会在`package.json`中生成相关的配置
```json
{
  "scripts": {
    "cz": "npm run log && git add . && git cz", 
    "log": "conventional-changelog --config ./node_modules/vue-cli-plugin-commitlint/lib/log -i CHANGELOG.md -s -r 0"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/vue-cli-plugin-commitlint/lib/cz"
    }
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

运行`log`的时候会自动生成`CHANGELOG.md`文件
```
# 0.1.0 (2020-07-27)

范围|描述|commitId
--|--|--
 - | 这里是commit信息 | [e988dd7](https://github.com/xanggang/project-template/commit/e988dd7)
```

在`commit`的时候必须用`<type>: <subject>`的格式保存，其中type用于说明 commit 的类别，只允许使用下面7个标识，也可以自己在配置文件中更改或者扩展。
```
规范名	描述
docs	仅仅修改了文档，比如 README, CHANGELOG, CONTRIBUTE 等等
chore	改变构建流程、或者增加依赖库、工具等
feat	新增 feature
fix	修复 bug
merge	合并分之
perf	优化相关，比如提升性能、体验
refactor	代码重构，没有加新功能或者修复 bug
revert	回滚到上一个版本
style	仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑
test	测试用例，包括单元测试、集成测试等
```
subject是 commit 目的的简短描述，不能超过50个字符，且结尾不加英文句号。

#### 强制在git commit之前检查代码风格
添加`husky`这个库，然后在`package.json`的`hooks`中添加`"pre-commit": "npm run lint",` 在commit之前进行eslint校验
```json
  "config": {
    "commitizen": {
      "path": "./node_modules/vue-cli-plugin-commitlint/lib/cz"
    }
  }
```
