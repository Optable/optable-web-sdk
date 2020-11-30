.DEFAULT_GOAL := all

.PHONY: all
all: html react

.PHONY: html
html:
	envsubst < ./vanilla/identify.html.tpl > ./vanilla/identify.html && \
	envsubst < ./vanilla/witness.html.tpl > ./vanilla/witness.html && \
	envsubst < ./vanilla/profile.html.tpl > ./vanilla/profile.html && \
	envsubst < ./vanilla/targeting/gam360.html.tpl > ./vanilla/targeting/gam360.html && \
	envsubst < ./vanilla/targeting/gam360-cached.html.tpl > ./vanilla/targeting/gam360-cached.html && \
	envsubst < ./vanilla/targeting/prebid.html.tpl > ./vanilla/targeting/prebid.html && \
	envsubst < ./vanilla/targeting/prebid-us-east-16.html.tpl > ./vanilla/targeting/prebid-us-east-16.html && \
	envsubst < ./vanilla/authenticator.html.tpl > ./vanilla/authenticator.html

.PHONY: react
react:
	npm --prefix react run build
