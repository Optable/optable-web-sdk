# Develop

## Dependencies

The recommended way to develop Optable Web SDK is to use [Docker Compose](https://docs.docker.com/compose/install/).
You can also develop it natively by installing Node and NPM on your machine.

## Build

Run `npm run build` to build both the browser bundle and the ES6 library.

### Browser bundle

Run `npm run build-web` to only build the browser bundle.

The resulting browser bundle in `browser/dist/sdk.js` built by webpack is self a self containing JS tag transpiled by babel to support most active browsers.
You can see the effective list of supported browsers using: `npx browserslist "> 0.25%, not dead"`

### ES6 library

Run `npm run build-lib` to only build the ES6 library that can then be published as a NPM package.
The resulting code in `lib/dist` contains ES6 JS code transpiled by Typescript alongside type definition files that are packed by package.json when producing the NPM library.
An experimental NPM package can be built locally with `npm pack` or `npm link`.

It's worth noting that the CI is currently responsible of publishing the library NPM upon git tag push (including when drafting a GitHub Release referencing a new tag).
The version indicated by the pushed tag is injected by `scripts/patch-version.sh` in both the package.json and lib/build.json prior building and publishing.
The later is necessary mostly for debugging purposes as it's being sent as a query param in sandbox interactions.

### Standalone docker container

Standalone [docker](https://www.docker.com/) images running [nginx](https://www.nginx.com/) can be generated for both the demos and serving the browser bundle by
using `make build-sdk`.
The nginx configuration file used to serve the browser bundle can be found in conf/nginx.conf.tpl.

## Using Docker Compose

`docker-compose up --build` will build and start both the SDK standalone docker container and a separate container with several web SDK demos.

Additionally, a couple of builder containers will also be started, which will watch for changes to either SDK source code in lib/ or browser/ or web SDK demos HTML template changes to .tpl files in demos/... when changes are detected, rebuilds will happen automatically.

Once started via docker-compose, you can access the demos by browsing to `http://localhost:8080/`

The latest SDK standalone bundle build will be accessible from `http://localhost:8081/sdk.js`

The demos and SDK running via `docker-compose` will by default communicate with an Optable Sandbox "edge" running on `http://localhost:80/`
