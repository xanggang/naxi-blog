---
title: 从零开始搭建一个企业级vue脚手架
date: 2020-07-22
categories:
 - vue
tags:
 - 脚手架
---

### 前沿

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
 (*) Unit Testing // 单元测试
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
这里我们选择了`element-ui`, `npm i element-ui -S`。然后开始element的处理
#### 按需加载


### 添加axios
作为目前最受欢迎的请求库，axios我们也要封装一下`npm i axios -S`
#### 
