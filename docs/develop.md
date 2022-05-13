# Develop

## Dependencies

The recommended way to develop Optable Web SDK is to use [Docker Compose](https://docs.docker.com/compose/install/).
You can also develop it natively by installing Node and NPM on your machine.

## Using Docker Compose

`docker-compose up` will build and start both the SDK standalone docker container and a separate container with several web SDK demos.

Once started via docker-compose, you can access the demos by browsing to `http://localhost:8081/`.
(Re)-Building of browser bundle, sdk and demos is done locally using `make`.

The latest SDK standalone bundle build will be accessible from `http://localhost:8181/sdk.js`

The demos and SDK running via `docker-compose` will by default communicate with an Optable Sandbox "edge" running on `https://node1.cloud.test/`

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

### Docker images

Standalone [docker](https://www.docker.com/) images running [nginx](https://www.nginx.com/) can be generated for both the demos and serving the browser bundle by
using `make build-sdk`.
The nginx configuration file used to serve the browser bundle can be found in conf/nginx.conf.tpl.

## Publish

The CI is currently responsible of publishing the library NPM and the browser bundle on GCS upon git tag push (including when drafting a GitHub Release referencing a new tag).
The version indicated by the pushed tag is injected by `scripts/patch-version.sh` in both the package.json and lib/build.json prior building and publishing.
The later is necessary mostly for debugging purposes as it's being sent as a query param in sandbox interactions.

### Publishing the NPM lib manually

Make sure [docker](https://www.docker.com/) and [make](https://linux.die.net/man/1/make) are installed.

To publish on NPM you must first login with an account that has publish rights on @optable NPM scope.
You can do so with if you have npm installed with `npm login --scope @optable`
or with docker `docker run -v $HOME/.npmrc:/root/.npmrc nodejs:alpine npm login --scope @optable`.

Then given a target version "X.Y.Z-pre" run `make BUILD_VERSION=vX.Y.Z-pre publish-sdk-lib`.

### Publishing the GCS browser bundle manually

Make sure [docker](https://www.docker.com/) and [make](https://linux.die.net/man/1/make) are installed.

To publish on GCS you must first login with an account that has write access on gs://optable-web-sdk.
You can do so with if you have gcloud installed with `gcloud auth login`
or with docker `docker run -v $HOME/.config/gcloud:/root/.config/gcloud google/cloud-sdk:alpine gcloud auth login`.

Then given a target version "X.Y.Z-pre" run `make BUILD_VERSION=vX.Y.Z-pre publish-sdk-web`.
