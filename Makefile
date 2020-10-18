# BUILD_VERSION is the version of the build.
BUILD_VERSION ?= $(shell git describe --tags)
# BUILD_COMMIT is the commit from which the binary was built.
BUILD_COMMIT ?= $(shell git rev-parse HEAD)
# BUILD_DATE is the date at which the binary was built.
BUILD_DATE ?= $(shell date -u "+%Y-%m-%dT%H:%M:%S+00:00")

TAG ?= latest

define BUILD_ARGS
--build-arg="BUILDKIT_INLINE_CACHE=1" \
--build-arg="BUILD_VERSION=$(BUILD_VERSION)" \
--build-arg="BUILD_COMMIT=$(BUILD_COMMIT)" \
--build-arg="BUILD_DATE=$(BUILD_DATE)"
endef

define BUILD_DEMOS_ARGS
--build-arg="SDK_URI=https://sandbox.optable.co/static/web/sdk.js" \
--build-arg="SANDBOX_HOST=sandbox.optable.co" \
--build-arg="SANDBOX_INSECURE=false"
endef

.DEFAULT_GOAL := build

.PHONY: all
all: build publish

.PHONY: build
build: build-sdk build-demos

#
# Build web SDK and web demos targets
#
.PHONY: build-sdk
build-sdk:
	docker build . $(BUILD_ARGS) --target run -t optable-web-sdk:$(TAG)

.PHONY: build-demos
build-demos:
	docker build . $(BUILD_ARGS) $(BUILD_DEMOS_ARGS) --target run_demos -t optable-web-sdk-demos:$(TAG)

#
# Publish web SDK and web demos container images
#

.PHONY: publish-sdk-lib
publish-sdk-lib:
	docker build . $(BUILD_ARGS) --build-arg="NPMJS_AUTH_TOKEN=$(NPMJS_AUTH_TOKEN)" --target publish-lib -t optable-web-sdk:$(TAG)-publish-lib
	docker run optable-web-sdk:$(TAG)-publish-lib npm publish --access public

.PHONY: publish-sdk-web
publish-sdk-web:
	docker build . $(BUILD_ARGS) --target publish-web -t optable-web-sdk:$(TAG)-publish-web
	docker run \
		--volume $(HOME)/.config/gcloud:/root/.config/gcloud \
		--volume $(shell pwd)/.git:/publish/.git \
		optable-web-sdk:$(TAG)-publish-web \
		gs-publish.sh gs://optable-web-sdk ./sdk.js $(BUILD_VERSION)

.PHONY: publish-demos
publish-demos: build-demos
	docker tag optable-web-sdk-demos:$(TAG) gcr.io/optable-platform/optable-web-sdk-demos:$(TAG)
	docker push gcr.io/optable-platform/optable-web-sdk-demos:$(TAG)
