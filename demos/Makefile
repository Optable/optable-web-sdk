.DEFAULT_GOAL := all

.PHONY: all
all: html react

.PHONY: html
html:
	envsubst < ./vanilla/identify.html.tpl > ./vanilla/identify.html && \
	envsubst < ./vanilla/targeting/gam360.html.tpl > ./vanilla/targeting/gam360.html && \
	envsubst < ./vanilla/targeting/gam360-cached.html.tpl > ./vanilla/targeting/gam360-cached.html && \
	envsubst < ./publishers/www.lapresse.ca/index.html.tpl > ./publishers/www.lapresse.ca/index.html

.PHONY: react
react:
	npm --prefix react run build
