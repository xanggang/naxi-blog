---
title: 使用docker快速安装服务器环境
date: 2020-07-15
categories:
 - 生态
tags:
 - docker
---
 ### 安装docker服务
 1， 更新软件库
 `yum update -y`
 
 2， 安装docker服务
 `yum install docker -y`
 
 3，启动docker服务
```
systemctl start docker  已守护进程启动
service docker start
service docker restart  // 重启docker服务
service docker stop     // 停止docker服务
```

 4， 使用docker安装Jenkins
 ```
 docker pull jenkins:latest
 docker run -d -u 0 --privileged  --name jenkins -p 9001:8080 -v /root/jenkins_node:/var/jenkins_home jenkins:latest
 
 // 在jenkins内获取外部的docker服务
 docker run -d -u 0 --privileged  --name jenkins -p 9001:8080 -v /root/jenkins_node:/var/jenkins_home -v /usr/bin/docker:/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock jenkin/docker:1.0
 ```
 
 5， 其他相关安装配置
 
 http://45.77.75.106:49003/pluginManager/ 跳过首次配置， 进入管理页面
 ```
  jenkins安装更新时，默认会检查网络连接，而默认的checkulr 是http://www.google.com/ ，国内是无法访问的，所以修改成任意可以访问的地址即可，比如http://www.baidu.com
  
  安装或者重装	Localization: Chinese (Simplified)汉化页面
  更改 升级地址 http://mirror.esuni.jp/jenkins/updates/update-center.json
vi /var/lib/jenkins/updates/default.json
```
6. 使用docker安装可视化管理工具

`docker search portainer`
```
单机运行
docker run -d -p 9000:9000 \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --name prtainer-test \
    portainer/portainer
```
7. 安装gitlab

```
docker pull gitlab/gitlab-ce
$ docker run -d  -p 9003:443 -p 9004:80 -p 9005:22 --name gitlab --restart always -v /root/gitlab/config:/etc/gitlab -v /root/gitlab/logs:/var/log/gitlab -v /root/gitlab/data:/var/opt/gitlab gitlab/gitlab-ce
```

8， 安装mysql服务
```
docker pull mysql:5.7
docker run -d -p 3306:9006 --name mysql --restart=always -e MYSQL_ROOT_PASSWORD=password -v /root/mysql/conf.d:/etc/mysql/my.cnf -v /root/mysql/data:/var/lib/mysql mysql:5.7
```
