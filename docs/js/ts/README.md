---
title: 封装一个路由装饰器
date: 2021-04-08
categories:
 - 生态
tags:
 - typescript
 - js
---

## Reflect Metadata
Reflect Metadata 是 ES7 的一个提案，它主要用来在声明的时候添加和读取元数据。TypeScript 在 1.5+ 的版本已经支持它，你只需要：
`npm i reflect-metadata --save`, 然后在 `tsconfig.json` 里配置 `emitDecoratorMetadata` 选项。
所以在使用ts版本的egg中， 可以利用装饰器来轻松的实现路由装饰器的封装。实现下面的功能
```typescript
@Controller('/test')
class SomeClass {
  @Get('/a')
  someGetMethod() {
    return 'hello world';
  }

  @Post('/b')
  somePostMethod() {}
}
```
## 实现

```typescript
import { Application } from 'egg';
import 'reflect-metadata';

// 定义变量， 这些值会通过 Reflect.defineMetadata方法注入到controller或者methods上
// 定义这个接口是的类型
const METHOD_METADATA = 'method';
// 定义接口的path
const PATH_METADATA = 'path';
// 定义controller的前缀
const PREFIX_METADATA = 'prefix';
// 记录method的中间件
const MIDDLEWARE_METADATA = 'middleware';
// 将装饰器收集到的方法都集中到这里，统一输出
const map = new Map();

type IDecoratorMethods = 'get' | 'post' | 'put' | 'delete';

export interface IRouterDecoratorOptions {
  prefix?: string
}

// 创建方法的装饰器
// 第一层闭包， return一个装饰器， 最终使用的是这个
const createMappingDecorator = (method: IDecoratorMethods) =>
  // 第二层闭包， 接收path、middlewareList
  (path: string, middlewareList?: any[]): MethodDecorator => {
    // target 装饰器修饰类的方法的时候， target是这个类的原型
    // key 方法的key
    // descriptor.value 被修饰的方法
    return (target: Object, key: any, descriptor: PropertyDescriptor) => {
      // 将这个controller类记录下来，后续从这里便利
      map.set(target, target);
      // 在这个methods上添加一个path属性， 值为传入的值 @get('/api')
      Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
      // 在这个methods上添加一个method属性, 值为get
      Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
      // 如果这个methods需要中间件， 则将middleware记录下来
      if (middlewareList && Array.isArray(middlewareList) && middlewareList.length) {
        Reflect.defineMetadata(MIDDLEWARE_METADATA, middlewareList, descriptor.value);
      }
    };
  };

// 类的装饰器， 给这整个controller一个统一的前缀
const Prefix = (path: string): ClassDecorator => {
  // target 类本身
  return (target: any) => {
    Reflect.defineMetadata(PREFIX_METADATA, path, target.prototype);
  };
};

const Get = createMappingDecorator('get');
const Post = createMappingDecorator('post');
const Put = createMappingDecorator('put');
const Delete = createMappingDecorator('delete');

// 上面将路由信息都分类记录下来类， 这里将这些信息整理 然后注入的egg的router里
function getRouter(app: Application, options: IRouterDecoratorOptions = {}) {
  const globalPrefix = options.prefix || ''

  // map里保存的是全部的controller
  // value就是controller的原型
  map.forEach((value) => {
    // 从controller中筛选出methods
    const propertyNames = Object.getOwnPropertyNames(value)
      .filter(pName => pName !== 'constructor' && pName !== 'pathName' && pName !== 'fullPath');
    // 从controller上获取prefix
    const prefix = Reflect.getMetadata(PREFIX_METADATA, value) || '';

    propertyNames.forEach(name => {
      // name是controller的方法名字
      // reqMethod是controller的method
      const reqMethod = Reflect.getMetadata(METHOD_METADATA, value[name]);
      const path = Reflect.getMetadata(PATH_METADATA, value[name]);
      const middlewareList = Reflect.getMetadata(MIDDLEWARE_METADATA, value[name]) || [];
      if (!reqMethod || !path) return
      // 重新构造一个controller方法
      const controller = async (ctx, next) => {
        // value是controller文件夹下的controller的原型，
        // new value.constructor(ctx)则是一个新的constructor类，
        const instance = new value.constructor(ctx);
        // 调用这个constructor的方法
        await instance[name](ctx);
      };

      app.router[reqMethod](globalPrefix + prefix + path, ...middlewareList, controller);
    });
  });
}


export {
  Get,
  Post,
  Put,
  Delete,
  Prefix,
  getRouter
};

```


这里有个不好理解的地方单独讲一下

```typescript
// value是constructor的类的原型
// new value.constructor(ctx)则是一个新的类的实例
// instance[name](ctx); 调用类的某一个方法
const controller = async (ctx, next) => {
    // value是controller文件夹下的controller的原型，
    // new value.constructor(ctx)则是一个新的constructor类，
    const instance = new value.constructor(ctx);
    // 调用这个constructor的方法
    await instance[name](ctx);
};
```

举个例子
```javascript
class A {
  constructor(name) {
    this.name = name
  }

  log () {
    console.log (this.name)
  }
}

const a1 = new A('foo')
const a2 = new A.prototype.constructor('foo')
console.log(a1 === a2) // false
a1.log() // foo
a2.log() // foo
console.log(a1.__proto__ === a2.__proto__) // true
```

## 使用
使用的时候需要在`app/router.ts`中注册全部的路由
```typescript

export default async (app: Application) => {

  const { router, controller } = app
  getRouter(app, {
    prefix: '/api', // 全局的前缀， 只影响到装饰器写的接口
  })
  // 绕过装饰器也可以继续使用原来方法
  router.get('/', controller.index.index)
};

```

```typescript
@Prefix('/account')
class AccountController extends Controller {

  @Get('/check', [middleware1, middleware2])
  public async checkUserName() {
    // do something
  }
}
```
