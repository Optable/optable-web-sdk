.DEFAULT_GOAL := html

SDK_URI ?= http://localhost:8081/sdk.js
SANDBOX_HOST ?= localhost
SANDBOX_INSECURE ?= true

.PHONY: html
html:
	SDK_URI=$(SDK_URI) \
	SANDBOX_HOST=$(SANDBOX_HOST) \
	SANDBOX_INSECURE=$(SANDBOX_INSECURE) \
	envsubst < ./vanilla/identify.html.tpl > ./vanilla/identify.html && \
	envsubst < ./vanilla/targeting/gam360.html.tpl > ./vanilla/targeting/gam360.html && \
	envsubst < ./publishers/www.lapresse.ca/index.html.tpl > ./publishers/www.lapresse.ca/index.html
