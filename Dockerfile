FROM node:14.5.0-alpine3.10 AS build

RUN apk --update add --no-cache gettext bash make && apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing watchexec
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

# lib
RUN npm run build-lib

# browser
ARG WEBPACK_MODE=production
RUN npm run build-web -- --mode $WEBPACK_MODE

# demos
RUN npm --prefix demos/react ci

ARG SDK_URI=/sdk.js
ENV SDK_URI=$SDK_URI
ARG SANDBOX_HOST
ENV SANDBOX_HOST=$SANDBOX_HOST
ARG SANDBOX_INSECURE
ENV SANDBOX_INSECURE=$SANDBOX_INSECURE

RUN make -C demos

FROM nginx:1.17 AS run
WORKDIR /usr/share/nginx/html/
COPY --from=build /build/browser/dist/sdk.js ./sdk.js
COPY --from=build /build/conf/nginx.conf /etc/nginx/conf.d/default.conf

FROM nginx:1.17 AS run_demos
WORKDIR /usr/share/nginx/html/
COPY --from=build /build/demos/publishers/ ./publishers/
COPY --from=build /build/demos/vanilla/targeting/gam360.html ./vanilla/targeting/gam360.html
COPY --from=build /build/demos/vanilla/identify.html ./vanilla/identify.html
COPY --from=build /build/demos/react/dist/ ./react/dist/
COPY --from=build /build/demos/index.html ./index.html
