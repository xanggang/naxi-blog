---
title: 从零开始一个前端日志监控系统（三）工具篇
date: 2021-04-02
categories:
 - 生态
tags:
 - js
 - node
 - html
---
## 前言
这里提供了两种上传js.map的方式。 为了保持线上的代码和mao文件匹配， 需要在每次build的时候上传map文件。
这一步最好是放在ci中来做。

### webpack插件
```javascript
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const http = require('http')
const packagePath = process.cwd()
const pkg = require(path.join(packagePath, 'package.json'))
const projectName = pkg.name

module.exports = class {
  constructor (option = {}) {
    if (!option.uploadUrl) {
      throw new Error('请输入uploadUrl')
    }
    this.uploadUrl = option.uploadUrl
  }

  apply (compiler) {
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    compiler.hooks.done.tap('upload-sourcemap-plugin', async e => {
      const _path = e.compilation.options.output.path
      const list = glob.sync(path.join(_path, './**/*.{js.map,}'))
      for (const i of list) {
        await this.upload(i)
          .catch(e => {
            console.error(e)
          })
      }
    })
  }

  upload (filePath) {
    // eslint-disable-next-line no-console
    console.log('上传' + filePath)
    return new Promise((resolve, reject) => {
      const appName = projectName || 'not-name'
      const url = `${this.uploadUrl}?fileName=${path.basename(filePath)}&appName=${appName}`
      const option = {
        method: 'POST', // 请求类型
        headers: { // 请求头
          'Content-Type': 'application/octet-stream', // 数据格式为二进制数据流
          'Transfer-Encoding': 'chunked', // 传输方式为分片传输
          Connection: 'keep-alive' // 这个比较重要为保持链接。
        }
      }
      // 这里有bug， 上传完成之后链接不会断开
      const req = http.request(url, option, res => {
        if (res.statusCode !== 200) {
          res.on('data', (chunk) => {
            console.error(`响应主体: ${chunk}`)
          })
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`${filePath}上传失败`)
        } else {
          resolve(filePath)
          // req.abort()
          // 手动断开的话
        }
      })
      req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`)
      })
      fs.createReadStream(filePath)
        .on('data', chunk => {
          req.write(chunk)
        })
        .on('end', (res) => {
          req.end()
          resolve(res)
        })
    })
  }
}

```

使用
```javascript
module.exports = {
  configureWebpack: {
    plugins: [
      // eslint-disable-next-line new-cap
      new uploadSourceMapWebPlugin({
        uploadUrl: 'http://owl.lynn.cool/api/log/upload-map'
      })
    ]
  }
}

```

#### 缺点
这种方式并不好， 一方面污染了构建的流程，降低了流程步骤的纯洁性， 另一方面文件直接放在服务器磁盘上
会造成巨大的浪费。

## 通过ci上传到七牛云
```javascript
/* eslint-disable  */
const fs = require('fs')
const path = require('path')
const qiniu = require('qiniu')

const basePath = path.resolve(process.cwd())
const sourcefolder = path.join(basePath, '/dist/')
const appName = 'owl-web'
const canUploadExt = ['.map']
// 要上传的空间
const bucket =  process.env.QINIU_BUCKET
const fileList = []

// 需要填写你的 Access Key 和 Secret Key
const ACCESS_KEY =  process.env.QINIU_ACCESS_KEY
const SECRET_KEY = process.env.QINIU_SECRET_KEY
const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)
const config = new qiniu.conf.Config()
const formUploader = new qiniu.form_up.FormUploader(config)
const putExtra = new qiniu.form_up.PutExtra()

// 生成token
function uptoken (bucket, key) {
  const options = {
    scope: `${bucket}:${appName}/${key}`
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  return putPolicy.uploadToken(mac)
}

// 读取全部文件
function readFileList (dir, filesList = []) {
  const dirExist = fs.existsSync(dir)
  if (!dirExist) return
  const files = fs.readdirSync(dir)
  if (files.length === 0) {
    console.log(`${dir}下没有可读取文件`)
    return
  }
  console.log(`当前目录：${dir}， 文件：${files}}`)
  files.forEach((item, index) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) // 递归读取文件
    } else {
      const fileExt = path.extname(item)
      if (canUploadExt.includes(fileExt)) {
        console.log(`文件名：${item}`)
        filesList.push({
          fileName: item,
          path: fullPath
        })
      }
    }
  })
  return filesList
}

// 上传文件
function uploadFile (uptoken, key, localFile) {
  return new Promise((resolve, reject) => {
    formUploader.putFile(uptoken, key, localFile, putExtra, function (respErr,
      respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody.key + '上传成功')
      } else {
        reject(respBody)
      }
    })
  })
}

// 批量上传
async function uploadFileList () {
  for (const item of fileList) {
    // 生成上传 Token
    const key = appName + '/' + item.fileName
    const token = uptoken(bucket, item.fileName)
    const res = await uploadFile(token, key, item.path)
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
    if (res) {
      console.log(res);
    }
  }
}

readFileList(sourcefolder, fileList)
uploadFileList()

```

使用：
在ci中使用node运行这个文件， 可以上传到七牛云，然后node端远程访问，并做好缓存。
