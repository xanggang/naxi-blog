---
title: 一些冷门的知识收集
date: 2020-07-28
categories:
 - html
tags:
 - css
 - html
---
 
####  attname
默认情况下，如果在浏览器中访问一个资源URL，浏览器都会试图直接在浏览器中打开这个资源，
例如一张图片。如果希望浏览器的动作是下载而不是打开，可以给该资源URL添加参数?attname=[file_name]

#### 二进制文件下载
```js
export function downloadFile (fileName, blob) {
  const aLink = document.createElement('a')

  const evt = document.createEvent('HTMLEvents')
  evt.initEvent('click', true, true)// initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
  aLink.download = fileName
  aLink.href = URL.createObjectURL(blob)

  aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))// 兼容火狐
}
```

### 批量下载
```js
import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'

function getFile (url) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function batchDownload (urls, callback = () => ({})) {
  return new Promise((resolve, reject) => {
    const promises = []
    urls.forEach((item, index) => {
      // 下载文件, 并存成ArrayBuffer对象
      const promise = getFile(item.url).then(data => {
        const arrName = item.url.split('/')
        // 去除末尾参数
        const fullFileName = arrName[arrName.length - 1].split('!')
        const fileName = fullFileName[0]
        downloadFile(fileName, new Blob([data]))
        // 一般用于进度条显示，每张图片下载完成之后，都会有一个回调
        callback(index)
      })
      promises.push(promise)
    })
    Promise.all(promises)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}
```
