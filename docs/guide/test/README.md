---
title: 【vue】跨域解决方案之proxyTable
date: 2017-12-28
categories:
 - frontEnd
tags:
 - vue
---
![An image](../../img.jpg)

### web-py 一个浏览器控制台的聊天工具。

#### 缘起， 一次异想天开
某日日常划水， 看到了这么一个网站的控制台 <a>http://www.alloyteam.com/</a>
在这个页面里， 通过在控制台输入文字的形式和程序实现交互，如同命令行一样和程序实现互动。 
我们都知道在控制台直接输入等于从window上读取对应的属性`window[value]`， 如果我们使用Proxy来拦截
window的get行为， 就可以实现对控制台的监听、拦截错误和实现交互。
基于这种机制，配合node的socket工具， 完全可以实现一个命令式的聊天工具。

#### 需求
一个在控制台交互的聊天工具， 可以实现群聊、私聊、登陆、注册、查看历史消息、当前全部用户等功能。 
全部的操作在控制台以以命令行的形式进行， 不需要页面元素的参与。
后端通过node + socket实现， 这里暂时不讲

#### 技术调研
在技术调研最初就遇到了致命的问题：
> 遇到的问题
- 全局的window对象无法代理和修改， 也不能通过`var object = { proxy: new Proxy(target, handler) };`的方式来代理
- 通过拦截window对象可以获取控制台输入的值， 但是所有的输入必须提前注册，否则还是会出现`ReferenceError`错误。
- `ReferenceError`无法通过改写原型、重新赋值、全局拦截这些方式来改写和覆盖。
- 非法字符输入会出现`SyntaxError`， 例如`11aa`, 并且无法改写和隐藏错误， 但是在消息输入的时候肯定会出现这种非法字符

> 解决办法
- 无法代理window对象， 我们退而求其次自定义一个对象， 后续全部操作全部用这个对象调用， 例如
```
    d.login
    d.sendMessage
```
- 针对非法输入导致的`SyntaxError`无法避免， 这种情况可以通过`window.prompt`来获取正确的字符串内容

解决了这个问题， 剩下的都是小问题， 具体的代码就不水了 大家可以去github上去看， 地址`https://github.com/xanggang/web-py`

#### 功能实现
在window上挂载来一个d的对象， 通过对这个对象的操作可以实现基本的聊天内容
当前已经实现的功能；
```
  'd.register': '注册用户， 密码大于等于6位',
  'd.login': '用户登陆',
  'd.loginOut': '退出登陆， 清除数据',
  'd.onLine': '查看当前在线列表',
  'd.to': 'd.to('userName')对某个用法发送私聊消息',
  'd.open': '打开对话框， 发送消息',
  'd.hmsg': '展示最近的50条消息',
  'd.c': '清空控制台'
```

入口文件通过
 ```js
const main = {
  init: function (url) {
    // Core实际上处理业务的类， 里面封装来各种业务实现
    const core = new Core()
    const d = new Proxy(core, {
      // target core类 propKey 用户的输入
      get: function(target, propKey) {
        // 一对一聊天
        if (propKey === 'to') {
          return (id) => {
            target[propKey](id)
          }
        }
        // target[propKey] 调用core的对应方法
        return target[propKey]()
      },
      set: function (e) {
        throw new Error('不允许修改')
      }
    });
    window.d = d
  }
}
```

```js
class Core {
  constructor(url) {
    this.userName = null
    this.msg = new Message()
    this.socket = null
    this.url = url
    this.connect()
  }

  getLoginInfo() {
    const userName = window.prompt('请输入账号')
    const passWord = window.prompt('请输入密码')
    return {
      userName,
      passWord
    }
  }

  register() {
    const { userName, passWord } = this.getLoginInfo()
    // 调用ajax 实现注册功能
    return "～～ 操作完成 ～～"
  }

  // 登录
  login() {
    const socketId = getCache('socketId')
    if (socketId) {
      this.msg.sendSysErr('本浏览器已经登陆， 清先退出登陆')
      return
    }
    const { userName, passWord } = this.getLoginInfo()

    let fun = async () => {
      const user = await login({userName, passWord})
      // 清除上一用户的聊天记录和id信息
      clearCacheAll()
      this.userName = user.data.userName
      this.msg.userName = user.data.userName
      saveCache('py_token_', user.data.token)
      this.connect()
    }

    fun()
    return "～～ 操作完成 ～～"
  }

  loginOut() {
    clearCacheAll()
    this.socket.close()
    return "～～ 操作完成 ～～"
  }
 
  // 保存用户信息和socketId
  setUser(user) {
    if (!this.userName) {
      this.userName = user.userName
      this.msg.userName = user.userName
    }
    saveCache('socketId', user.socketId)
  }

  connect() {
    const token = getCache('py_token_')
    const socketId = getCache('socketId')
    // 创建连接， socketId标识用户，同一个浏览器只能有一个标签进入聊天室， 其他的会被服务器端关闭。
    this.socket = socket(token, socketId, this.url)

    // 连接成功
    this.socket.on(SOCKET_EVENT.CONNECT, () => {
      const id = this.socket.id;
      this.socket.on(id, (msg) => {
        switch (msg.status) {
          // 错误提示
          case PRIVATE_EVENT.error:
            this.msg.sendSysErr(msg.msg);
            break;
          // 系统成功提示
          case PRIVATE_EVENT.SUCCESS:
            this.msg.sendSysInfo(msg.msg);
            break;
          // 错误提示， 系统推送当前用户信息
          case PRIVATE_EVENT.SET_USER:
            this.setUser(msg.msg)
            break;
          // 服务端要求客户端退出登陆
          case PRIVATE_EVENT.LOGIN_OUT:
            this.loginOut()
            break;
          // 服务端推送全部登陆用户
          case PRIVATE_EVENT.SET_ONLINE:
            store.setOnlineList(msg.msg)
            break;
          // 一对一私聊消息
          case PRIVATE_EVENT.PRIVATE_MSG:
            this.msg.acceptPrivateMsg(msg.user.userName, msg.msg);
            break;
        }
      });
    });

    // 连接断开
    this.socket.on(SOCKET_EVENT.DISCONNECT, (data) => {
      this.msg.sendSysErr('连接断开')
    })

    // 广播消息
    this.socket.on(SOCKET_EVENT.BROADCAST, (data) => {
      this.msg.send(data.data.message, data.user.userName)
    })

    // 系统消息
    this.socket.on(SOCKET_EVENT.SYS_BROADCAST, (message) => {
      this.msg.sendSysInfo(message)
    })

    // 在线用户列表
    this.socket.on(SOCKET_EVENT.ONLINE, (message) => {
      store.setOnlineList(message)
    })
  }

  onLine() {
    const userList = store.onlineList.map(o => o.userName)
    if (!userList.length) {
      this.msg.sendSysInfo('当前房间没有其他用户')
      return
    }
    this.msg.renderUserList(userList)
    return "～～ 操作完成 ～～"
  }

  // 发送一对一消息
  to(userName) {
    const userList = store.onlineList
    const toUser = userList.find(user => user.userName === userName)
    if (!toUser) {
      this.msg.sendSysErr('你要发送的用户不存在')
      return
    }
    const msg = window.prompt(`向${userName}发送私聊消息`)
    this.socket.emit(SOCKET_EVENT.SEND_PRIVATE_MSG, {
      socketId: toUser.socketId,
      message: msg
    })
    this.msg.sendPrivateMsg(userName, msg)
    return "～～ 操作完成 ～～"
  }

  // 打开输入框
  open() {
    if (!this.socket) {
      this.msg.sendSysErr('未连接')
      return
    }
    const msg = window.prompt()
    this.socket.emit('sendMsg', msg)
    return "～～ 操作完成 ～～"
  }

  // 查看历史消息
  hmsg() {
    this.msg.renderHistoryMessage()
    return "～～ 操作完成 ～～"
  }

  set() {}

  // 查看帮助信息
  help() {
    Object.entries(HELP_DATA).forEach(([key, text]) => {
      this.msg.renderHelp(key, text)
    })
    return "～～ 操作完成 ～～"
  }

  // 清空控制台
  c() {
    console.clear()
  }

}
```


#### 这个练手项目用到的知识点
 1, 利用Proxy来实现对某个对象的代理， 监听和拦截对象的操作


 2， 我们在控制台每一次输入都可以理解为调用了对应的方法， 并且会打印这个方法的返回值 默认为undefined
 
 3， 如果以`async`的方式调用， 则会返回一个Promise
 
 4， 浏览器可以通过打开多个标签的方式同时进入一个聊天室，这些标签会共享cookie和localStorage等， 将socketId保存在cookie中并且每次连接服务器时作为唯一携带， 在服务器就可以识别
 
 5， 通过 `console.log(`%c 消息`, 'background: #adbbff; color: #000000; padding: 3px')`的方式可以实现对console的样式定制
 
