FROM node:14.5.0-alpine3.10 AS build

RUN apk --update add --no-cache gettext bash
RUN npm install -g npm@6.14.5

WORKDIR /build

COPY ./package-lock.json ./package.json ./
RUN npm ci

ARG PATH_PREFIX=/static/web
ENV PATH_PREFIX=$PATH_PREFIX
COPY ./conf/ ./conf/
RUN envsubst '$PATH_PREFIX' < ./conf/nginx.conf.tpl > ./conf/nginx.conf

COPY ./ ./

ARG BUILD_VERSION=0.0.0-experimental
RUN ./scripts/patch-version.sh $BUILD_VERSION

ARG WEBPACK_MODE=production
RUN npm run build-web -- --mode $WEBPACK_MODE

FROM nginx:1.17 AS run
WORKDIR /usr/share/nginx/html/
COPY --from=build /build/browser/dist/sdk.js ./sdk.js
COPY --from=build /build/conf/nginx.conf /etc/nginx/conf.d/default.conf
