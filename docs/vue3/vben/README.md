---
title: vben阅读笔记
date: 2021-10-20
categories:
 - vu3
tags:
 - vue
 - js
---

## 前言
vue-vben-admin是当前vite+vue3最火爆的脚手架项目之一，内部架构和vue3的代码思想也是非常的厉害，最近准备做一次精读， 全面学习一下并且做个记录啥的。


## 换肤功能
通过`vite-plugin-theme`来实现的， 目前看起来这个库使用繁琐，使用量并不大，维护的也不是很频繁。 这个方案不是很成熟。


## 状态管理
vben中放弃了vuex， 而是使用`pinia`作为全局的状态管理工具，写法很相似，
#### Vuex的优点

- 支持调试功能，如时间旅行和编辑
- 适用于大型、高复杂度的Vue.js项目

#### Vuex的缺点

- 从 Vue 3 开始，getter 的结果不会像计算属性那样缓存
* Vuex 4有一些与类型安全相关的问题

#### Pinia的优点

- 完整的 TypeScript 支持：与在 Vuex 中添加 TypeScript 相比，添加 TypeScript 更容易
极其轻巧（体积约 1KB）
- store 的 action 被调度为常规的函数调用，而不是使用 dispatch 方法或 MapAction 辅助函数，这在 Vuex 中很常见
支持多个Store
- 支持 Vue devtools、SSR 和 webpack 代码拆分

#### Pinia的缺点
不支持时间旅行和编辑等调试功能

综合看起来， 还是继续使用vuex比较号


## 自定义指令
#### clickOutside指令
```ts
import { on } from '/@/utils/domUtils';
import { isServer } from '/@/utils/is';
import type { ComponentPublicInstance, DirectiveBinding, ObjectDirective } from 'vue';

type DocumentHandler = <T extends MouseEvent>(mouseup: T, mousedown: T) => void;

type FlushList = Map<
  HTMLElement,
  {
    documentHandler: DocumentHandler;
    bindingFn: (...args: unknown[]) => unknown;
  }
>;

const nodeList: FlushList = new Map();

let startClick: MouseEvent;

if (!isServer) {
  on(document, 'mousedown', (e: MouseEvent) => (startClick = e));
  on(document, 'mouseup', (e: MouseEvent) => {
    for (const { documentHandler } of nodeList.values()) {
      documentHandler(e, startClick);
    }
  });
}

function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding): DocumentHandler {
  console.log(binding.instance);
  let excludes: HTMLElement[] = [];
  if (Array.isArray(binding.arg)) {
    excludes = binding.arg;
  } else {
    // due to current implementation on binding type is wrong the type casting is necessary here
    excludes.push(binding.arg as unknown as HTMLElement);
  }
  return function (mouseup, mousedown) {
    const popperRef = (
      binding.instance as ComponentPublicInstance<{
        popperRef: Nullable<HTMLElement>;
      }>
    ).popperRef;
    const mouseUpTarget = mouseup.target as Node;
    const mouseDownTarget = mousedown.target as Node;
    const isBound = !binding || !binding.instance;
    const isTargetExists = !mouseUpTarget || !mouseDownTarget;
    const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget);
    const isSelf = el === mouseUpTarget;

    const isTargetExcluded =
      (excludes.length && excludes.some((item) => item?.contains(mouseUpTarget))) ||
      (excludes.length && excludes.includes(mouseDownTarget as HTMLElement));
    const isContainedByPopper =
      popperRef && (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget));
    if (
      isBound ||
      isTargetExists ||
      isContainedByEl ||
      isSelf ||
      isTargetExcluded ||
      isContainedByPopper
    ) {
      return;
    }
    binding.value();
  };
}

const ClickOutside: ObjectDirective = {
  beforeMount(el, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    });
  },
  updated(el, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    });
  },
  unmounted(el) {
    nodeList.delete(el);
  },
};

export default ClickOutside;
```

#### Loading
vue3中取消了原来的vue.extend方法，动态创建组件方式有变化
```ts
import { createVNode, render, reactive, defineComponent } from 'vue';

// defineComponent返回一个组件函数
const LoadingWrap = defineComponent({
  render() {
    return h(Loading, { ...data });
  },
});
// 生成一个未渲染的vnome
vm = createVNode(LoadingWrap);
// 渲染到div上 生成一个vue组件实例
render(vm, document.createElement('div'));
// 讲dom节点插入到文档
target.appendChild(vm.el as HTMLElement);
// 移除
vm.el.parentNode.removeChild(vm.el);
```
