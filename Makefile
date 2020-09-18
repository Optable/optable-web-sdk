DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# BUILD_VERSION is the version of the build.
BUILD_VERSION ?= $(shell git describe)
# BUILD_COMMIT is the commit from which the binary was build.
BUILD_COMMIT ?= $(shell git rev-parse HEAD)
# BUILD_DATE is the date at which the binary was build.
BUILD_DATE ?= $(shell date -u "+%Y-%m-%dT%H:%M:%S+00:00")

TAG ?= latest

define BUILD_ARGS
--build-arg="BUILDKIT_INLINE_CACHE=1" \
--build-arg="BUILD_VERSION=$(BUILD_VERSION)" \
--build-arg="BUILD_COMMIT=$(BUILD_COMMIT)" \
--build-arg="BUILD_DATE=$(BUILD_DATE)" \
--build-arg="SANDBOX_HOST=sandbox.optable.co" \
--build-arg="SANDBOX_INSECURE=false"
endef

define BUILD_DEMOS_ARGS
--build-arg="SDK_URI=https://sandbox.optable.co/static/web/sdk.js"
endef

.DEFAULT_GOAL := build

.PHONY: all
all: build-sdk build-demos publish-sdk publish-demos

.PHONY: build
build: build-sdk build-demos

#
# Build web SDK and web demos targets
#
.PHONY: build-sdk
build-sdk:
	docker build . $(BUILD_ARGS) --target run -t gcr.io/optable-platform/optable-web-sdk:$(TAG)

.PHONY: build-demos
build-demos:
	docker build ./demos/. $(BUILD_ARGS) $(BUILD_DEMOS_ARGS) --target run -t gcr.io/optable-platform/optable-web-sdk-demos:$(TAG)

#
# Publish web SDK and web demos container images
#
.PHONY: publish-sdk
publish-sdk:
	docker push gcr.io/optable-platform/optable-web-sdk:$(TAG)

.PHONY: publish-demos
publish-demos:
	docker push gcr.io/optable-platform/optable-web-sdk-demos:$(TAG)
