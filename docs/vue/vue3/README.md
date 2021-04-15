---
title: vue3+ts踩坑
date: 2021-04-13
categories:
 - vue
tags:
 - 脚手架
---

### vue3+ts踩坑记录
#### 全局变量
```typescript
// main.ts
app.config.globalProperties.$microSPA = false

// shims-proper.d.ts
import { IFiltersTypes } from './filters'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filter: IFiltersTypes
  }
}

```

#### 全局过滤器
vue3取消了全局过滤器， 可以用全局方法代替
```typescript
// filters/index.ts
export function doSomeThing (str: string): string {
  return ''
}

export const filters = {
  doSomeThing: doSomeThing
}

export type IFiltersTypes = Partial<typeof filters>

export default function initFilter (app: App) {
  app.config.globalProperties.$filter = filters
}

// mian.ts

initFilter(app)

// shims-proper.d.ts 添加声明
import { IFiltersTypes } from './filters'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filter: IFiltersTypes
  }
}

// 调用
// {{ $filter.doSomeThing() }}
```

#### store类型
相关内容文档https://next.vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
即使这样, 在使用vuex的模块化的时候, 体验依不好, 下面的能够稍稍的优化一下
```typescript
import { createStore, Store, useStore as useBaseStore } from 'vuex'
import { InjectionKey } from 'vue'
import staff from './staff'
import permission from './permission'

export interface IRootStateTypes {
// 这里是vuex的根数据
}

export interface IAllStoreTypes extends IRootStateTypes {
  staff: any // 模块化的类型
  permission: any
}

// 声明一个key, 在main,ts中use(store, key) 也要用这个
export const key: InjectionKey<Store<IRootStateTypes>> = Symbol('vuexKey')

const storeMain = createStore<IRootStateTypes>({
  state: {

  },
  mutations: {

  },
  actions: {

  },
  modules: {
    staff,
    permission
  }
})

export default storeMain

// 使用useStore的时候用这个, 不然每次都要重新注入key
export function useStore<T = IAllStoreTypes> () {
  return useBaseStore<IAllStoreTypes>(key)
}

// 如果需要在vue之外使用可以用这个, 也可以获得类型
export function getStoreMain (): Store<IAllStoreTypes> {
  return storeMain as Store<IAllStoreTypes>
}
```
