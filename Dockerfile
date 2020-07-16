FROM node:alpine as builder

WORKDIR /app

COPY /package.json /app/

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install

COPY . /app/

# 打包
RUN npm run build

FROM nginx:latest

WORKDIR /app

# 复制到nginx镜像下
COPY --from=builder /app/docs/.vuepress/dist/ /app/

COPY nginx.conf /etc/nginx/nginx.conf
