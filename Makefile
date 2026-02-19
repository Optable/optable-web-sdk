.DEFAULT_GOAL := all

.PHONY: test-sdk
test: deps
	pnpm test

.PHONY: build-web
build-web: deps
	pnpm build-web -- --mode=production

.PHONY: build-lib
build-lib: deps
	pnpm build-lib

.PHONY: build
build: build-web build-lib

.PHONY: deps
deps:
	pnpm install --frozen-lockfile

export SDK_URI ?= https://localhost:8181/sdk.js
export DCN_HOST ?= ca.edge.optable.co
export DCN_SITE ?= web-sdk-demo
export DCN_NODE ?= optable
export DCN_LEGACY_HOST_CACHE ?= sandbox.optable.co
export DCN_INIT ?= true
export UID2_BASE_URL ?= https://operator-integ.uidapi.com

.PHONY: demos
demos: demo-html demo-react demo-npm

DEMO_VARS:='\
	SDK_URI=$${SDK_URI} \
	DCN_HOST=$${DCN_HOST} \
	DCN_SITE=$${DCN_SITE} \
	DCN_NODE=$${DCN_NODE} \
	DCN_LEGACY_HOST_CACHE=$${DCN_LEGACY_HOST_CACHE} \
	DCN_INIT=$${DCN_INIT} \
	ADS_SITE=$${ADS_SITE} \
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
	envsubst $(DEMO_VARS) < demos/vanilla/targeting/gam360-adcp.html.tpl > demos/vanilla/targeting/gam360-adcp.html
	envsubst $(DEMO_VARS) < demos/vanilla/targeting/prebid.html.tpl > demos/vanilla/targeting/prebid.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/identify.html.tpl > demos/vanilla/nocookies/identify.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/witness.html.tpl > demos/vanilla/nocookies/witness.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/profile.html.tpl > demos/vanilla/nocookies/profile.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/gam360.html.tpl > demos/vanilla/nocookies/targeting/gam360.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/gam360-cached.html.tpl > demos/vanilla/nocookies/targeting/gam360-cached.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/gam360-adcp.html.tpl > demos/vanilla/nocookies/targeting/gam360-adcp.html
	envsubst $(DEMO_VARS) < demos/vanilla/nocookies/targeting/prebid.html.tpl > demos/vanilla/nocookies/targeting/prebid.html
	envsubst $(DEMO_VARS) < demos/vanilla/uid2_token/login.html.tpl > demos/vanilla/uid2_token/login.html
	envsubst $(DEMO_VARS) < demos/vanilla/uid2_token/index.html.tpl > demos/vanilla/uid2_token/index.html
	envsubst $(DEMO_VARS) < demos/vanilla/pair/index.html.tpl > demos/vanilla/pair/index.html

.PHONY: demo-react
demo-react: build-lib
	pnpm --prefix demos/react install --frozen-lockfile
	pnpm --prefix demos/react run build

.PHONY: demo-npm
demo-npm:
	pnpm --prefix demos/npm install --frozen-lockfile
	pnpm --prefix demos/npm run build

.PHONY: certs
certs:
	mkcert -install
	mkcert -cert-file nginx/tls/cert.pem -key-file nginx/tls/key.pem localhost

.PHONY: mise
mise:
	mise install

all: mise certs test build demos
