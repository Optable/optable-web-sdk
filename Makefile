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

export SDK_URI ?= https://localhost:8181/sdk.js
export SANDBOX_HOST ?= sandbox.optable.co
export SANDBOX_INSECURE ?= false
export SANDBOX_INIT ?= true
export ADS_HOST ?= ads.optable.co
export ADS_REGION ?= ca
export UID2_BASE_URL ?= https://operator-integ.uidapi.com

.PHONY: demo-html
demos: demo-html demo-react demo-npm

DEMO_VARS:='\
	SDK_URI=$${SDK_URI} \
	SANDBOX_HOST=$${SANDBOX_HOST} \
	SANDBOX_INSECURE=$${SANDBOX_INSECURE} \
	SANDBOX_INIT=$${SANDBOX_INIT} \
	ADS_HOST=$${ADS_HOST} \
	ADS_REGION=$${ADS_REGION} \
	UID2_BASE_URL=$${UID2_BASE_URL} \
	'

.PHONY: demo-html
demo-html:
	envsubst $(DEMO_VARS) < demos/vanilla/identify.html.tpl > demos/vanilla/identify.html
	envsubst $(DEMO_VARS) < demos/vanilla/witness.html.tpl > demos/vanilla/witness.html
	envsubst $(DEMO_VARS) < demos/vanilla/profile.html.tpl > demos/vanilla/profile.html
	envsubst $(DEMO_VARS) < demos/vanilla/targeting/gam360.html.tpl > demos/vanilla/targeting/gam360.html
	envsubst $(DEMO_VARS) < demos/vanilla/targeting/gam360-cached.html.tpl > demos/vanilla/targeting/gam360-cached.html
	envsubst $(DEMO_VARS) < demos/vanilla/targeting/prebid.html.tpl > demos/vanilla/targeting/prebid.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/identify.html.tpl > demos/vanilla/nocookies/identify.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/witness.html.tpl > demos/vanilla/nocookies/witness.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/profile.html.tpl > demos/vanilla/nocookies/profile.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/gam360.html.tpl > demos/vanilla/nocookies/targeting/gam360.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/gam360-cached.html.tpl > demos/vanilla/nocookies/targeting/gam360-cached.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/prebid.html.tpl > demos/vanilla/nocookies/targeting/prebid.html
	envsubst $(DEMO_VARS) < demos/integration/lmpid-prebid-gpt.html.tpl > demos/integration/lmpid-prebid-gpt.html
	envsubst $(DEMO_VARS) < demos/integration/lmpid-signal-gpt.html.tpl > demos/integration/lmpid-signal-gpt.html
	envsubst $(DEMO_VARS) < demos/ads/protected-audience/advertiser.html.tpl > demos/ads/protected-audience/advertiser.html
	envsubst $(DEMO_VARS) < demos/ads/protected-audience/publisher.html.tpl > demos/ads/protected-audience/publisher.html
	envsubst $(DEMO_VARS) < demos/ads/protected-audience/publisher-gam.html.tpl > demos/ads/protected-audience/publisher-gam.html
	envsubst $(DEMO_VARS) < demos/ads/protected-audience/publisher-prebid.html.tpl > demos/ads/protected-audience/publisher-prebid.html
	envsubst $(DEMO_VARS) < demos/ads/protected-audience/ad.html.tpl > demos/ads/protected-audience/ad.html
	envsubst $(DEMO_VARS) < demos/vanilla/uid2_token/login.html.tpl > demos/vanilla/uid2_token/login.html
	envsubst $(DEMO_VARS) < demos/vanilla/uid2_token/index.html.tpl > demos/vanilla/uid2_token/index.html

.PHONY: demo-react
demo-react: build-lib
	npm --prefix demos/react ci
	npm --prefix demos/react run build

.PHONY: demo-npm
demo-npm:
	npm --prefix demos/npm ci
	npm --prefix demos/npm run build

.PHONY: certs
certs:
	mkcert -install
	mkcert -cert-file nginx/tls/cert.pem -key-file nginx/tls/key.pem localhost

.PHONY: asdf
asdf:
	-asdf plugin add nodejs
	-asdf plugin add semver
	-asdf plugin add mkcert
	asdf install

all: asdf certs test build demos
