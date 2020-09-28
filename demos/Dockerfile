FROM node:14.11.0-alpine3.12 AS build
WORKDIR /build

RUN apk --update add --no-cache gettext make \
  && apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing watchexec

COPY . .

# Default to /sdk.js which would be expected to be mounted as volume in development
# In production this is likely to be set to https://<sandbox>/static/web/sdk.js
ARG SDK_URI=/sdk.js
ENV SDK_URI=$SDK_URI
ARG SANDBOX_HOST
ENV SANDBOX_HOST=$SANDBOX_HOST
ARG SANDBOX_INSECURE
ENV SANDBOX_INSECURE=$SANDBOX_INSECURE

# Build html from .tpl template files:
RUN make html

# Build react demos:
RUN npm --prefix react ci
RUN make react

FROM nginx:1.17 AS run
WORKDIR /usr/share/nginx/html
COPY --from=build /build/publishers ./
COPY --from=build /build/vanilla/targeting/gam360.html ./vanilla/targeting/gam360.html
COPY --from=build /build/vanilla/identify.html ./vanilla/identify.html
COPY --from=build /build/react/dist/ ./react/dist/
COPY --from=build /build/index.html ./index.html
