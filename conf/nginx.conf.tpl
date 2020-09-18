server {
  listen 80;

  gzip on;
  gzip_min_length 1000;
  gzip_types application/javascript;

  root /usr/share/nginx/html;
  rewrite ^${PATH_PREFIX}/(.*)$ /$1 last;

  location / {
    add_header Cache-Control "public, max-age=2678400";
    try_files $uri =404;
  }
  location = / {
    return 200 "healthy\n";
  }
}
