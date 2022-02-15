FROM node:15-alpine3.13 AS build

RUN apk --update add --no-cache gettext bash make && apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing watchexec

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
COPY --from=build /build/demos/vanilla/targeting/gam360.html ./vanilla/targeting/gam360.html
COPY --from=build /build/demos/vanilla/targeting/gam360-cached.html ./vanilla/targeting/gam360-cached.html
COPY --from=build /build/demos/vanilla/targeting/prebid.html ./vanilla/targeting/prebid.html
COPY --from=build /build/demos/vanilla/targeting/prebid.js ./vanilla/targeting/prebid.js
COPY --from=build /build/demos/vanilla/identify.html ./vanilla/identify.html
COPY --from=build /build/demos/vanilla/profile.html ./vanilla/profile.html
COPY --from=build /build/demos/vanilla/witness.html ./vanilla/witness.html
COPY --from=build /build/demos/vanilla/nocookies/targeting/gam360.html ./vanilla/nocookies/targeting/gam360.html
COPY --from=build /build/demos/vanilla/nocookies/targeting/gam360-cached.html ./vanilla/nocookies/targeting/gam360-cached.html
COPY --from=build /build/demos/vanilla/nocookies/targeting/prebid.html ./vanilla/nocookies/targeting/prebid.html
COPY --from=build /build/demos/vanilla/nocookies/targeting/prebid.js ./vanilla/nocookies/targeting/prebid.js
COPY --from=build /build/demos/vanilla/nocookies/identify.html ./vanilla/nocookies/identify.html
COPY --from=build /build/demos/vanilla/nocookies/profile.html ./vanilla/nocookies/profile.html
COPY --from=build /build/demos/vanilla/nocookies/witness.html ./vanilla/nocookies/witness.html
COPY --from=build /build/demos/react/dist/ ./react/dist/
COPY --from=build /build/demos/index.html ./index.html
COPY --from=build /build/demos/index-nocookies.html ./index-nocookies.html
COPY --from=build /build/demos/css/ ./css/
COPY --from=build /build/demos/images/ ./images/

FROM google/cloud-sdk:alpine AS publish-web
WORKDIR /publish
ENV PATH="/publish:$PATH"

RUN curl -o semver "https://raw.githubusercontent.com/fsaintjacques/semver-tool/3.0.0/src/semver" && chmod +x semver

COPY --from=build /build/browser/dist/sdk.js ./sdk.js
COPY ./scripts/gs-publish.sh .
