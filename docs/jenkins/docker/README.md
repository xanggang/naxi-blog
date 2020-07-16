docker run --rm --name nginx-test -p 8080:80 -d nginx 创建一个临时的nginx容器
mkdir -p /home/nginx/www /home/nginx/logs /home/nginx/conf

其中：

      www: 目录将映射为 nginx 容器配置的虚拟目录。

      logs: 目录将映射为 nginx 容器的日志目录。

      conf: 目录里的配置文件将映射为 nginx 容器的配置文件。
      
docker cp 358354f206fd:/etc/nginx/nginx.conf /home/nginx/conf/

```

user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       80;

        location / {
          root   /usr/share/nginx/html/dist;
          index  index.html;
          try_files $uri $uri/ /index.html;
        }

    }


    include /etc/nginx/conf.d/*.conf;
}


```


docker run -d -p 8085:80 --name nginx -v /Users/lynn/Documents/nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /Users/lynn/Documents/nginx/www:/usr/share/nginx/html -v /Users/lynn/Documents/nginx/logs:/var/log/nginx nginx

docker run -d -p 9002:80 --name nginx -v ~/nginx-data/config/nginx.conf:/etc/nginx/nginx.conf -v ~/nginx-data/www:/usr/web -v ~/nginx-data/logs:/var/log/nginx nginx
