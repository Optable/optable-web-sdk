# optable-web-sdk

JavaScript and TypeScript SDK for integrating with optable-sandbox from a website.

## Dependencies

- NodeJS
- NPM

## Build

`npm run build` will build both standalone and ES6 library versions.

### Standalone bundle

```
SANDBOX_HOST=host SANDBOX_SITE=site \
  npm run build-web
```

### ES6 library

`npm run build-lib`

### Standalone docker container

This will build a [docker](https://www.docker.com/) container which includes [nginx](https://www.nginx.com/) and is capable of serving the standalone bundle version of the SDK:

`make build-sdk`

The nginx configuration file template can be found in conf/nginx.conf.tpl

## Develop

`docker-compose up --build` will build and start both the SDK standalone docker container and a separate container with several web SDK demos.

Additionally, a couple of builder containers will also be started, which will watch for changes to either SDK source code in lib/ or browser/ or web SDK demos HTML template changes to .tpl files in demos/... when changes are detected, rebuilds will happen automatically.

Once started via docker-compose, you can access the demos by browsing to `http://localhost:8080/`

The latest SDK standalone bundle build will be accessible from `http://localhost:8081/sdk.js`

The demos and SDK running via `docker-compose` will by default communicate with an Optable Sandbox "edge" running on `http://localhost:80/`

## Release

TODO

## Deploy

TODO
