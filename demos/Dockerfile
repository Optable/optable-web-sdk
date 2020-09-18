FROM alpine:3.7 AS build
WORKDIR /build

RUN apk --update add --no-cache gettext make \
  && apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing watchexec

COPY . .

# Default to /sdk.js which would be expected to be mounted as volume in development
# In production this is likely to be set to https://<sandbox>/static/web/sdk.js
ARG SDK_URI=/sdk.js
ARG SANDBOX_HOST
ARG SANDBOX_INSECURE

# Build html from .tpl template files:
RUN \
  SDK_URI=$SDK_URI \
  SANDBOX_HOST=$SANDBOX_HOST \
  SANDBOX_INSECURE=$SANDBOX_INSECURE \
  make html

# Delete template files from container:
RUN find . -name "*.tpl" -delete

FROM nginx:1.17 AS run
WORKDIR /usr/share/nginx/html
COPY --from=build /build/ ./
