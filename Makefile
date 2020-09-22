TAG ?= latest

define BUILD_ARGS
--build-arg="BUILDKIT_INLINE_CACHE=1" \
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
