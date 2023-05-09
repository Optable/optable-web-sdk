.DEFAULT_GOAL := all

.PHONY: test-sdk
test: deps
	npm run test

.PHONY: build-web
build-web: deps
	npm run build-web -- --mode=production

.PHONY: build-lib
build-lib: deps
	npm run build-lib

.PHONY: build
build: build-web build-lib

.PHONY: deps
deps:
	npm ci

export SDK_URI ?= http://localhost:8181/sdk.js
export SANDBOX_HOST ?= sandbox.optable.co
export SANDBOX_INSECURE ?= false
export UID2_BASE_URL ?= https://operator-integ.uidapi.com

.PHONY: demo-html
demos: demo-html demo-react demo-npm

.PHONY: demo-html
demo-html:
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/identify.html.tpl > demos/vanilla/identify.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/witness.html.tpl > demos/vanilla/witness.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/profile.html.tpl > demos/vanilla/profile.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/targeting/gam360.html.tpl > demos/vanilla/targeting/gam360.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/targeting/gam360-cached.html.tpl > demos/vanilla/targeting/gam360-cached.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/targeting/prebid.html.tpl > demos/vanilla/targeting/prebid.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/identify.html.tpl > demos/vanilla/nocookies/identify.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/witness.html.tpl > demos/vanilla/nocookies/witness.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/profile.html.tpl > demos/vanilla/nocookies/profile.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/targeting/gam360.html.tpl > demos/vanilla/nocookies/targeting/gam360.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/targeting/gam360-cached.html.tpl > demos/vanilla/nocookies/targeting/gam360-cached.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/vanilla/nocookies/targeting/prebid.html.tpl > demos/vanilla/nocookies/targeting/prebid.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/integration/loblawmedia-privateid-prebid-gpt.html.tpl > demos/integration/loblawmedia-privateid-prebid-gpt.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE}' < demos/integration/loblawmedia-privateid-signal-gpt.html.tpl > demos/integration/loblawmedia-privateid-signal-gpt.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE} $${UID2_BASE_URL} ' < demos/vanilla/uid2_token/login.html.tpl > demos/vanilla/uid2_token/login.html
	envsubst '$${SDK_URI} $${SANDBOX_HOST} $${SANDBOX_INSECURE} $${UID2_BASE_URL} ' < demos/vanilla/uid2_token/index.html.tpl > demos/vanilla/uid2_token/index.html

.PHONY: demo-react
demo-react: build-lib
	npm --prefix demos/react ci
	npm --prefix demos/react run build

.PHONY: demo-npm
demo-npm:
	npm --prefix demos/npm ci
	npm --prefix demos/npm run build

all: test build demos
