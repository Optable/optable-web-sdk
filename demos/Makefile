.DEFAULT_GOAL := html

.PHONY: html
html:
	envsubst < ./vanilla/identify.html.tpl > ./vanilla/identify.html && \
	envsubst < ./vanilla/targeting/gam360.html.tpl > ./vanilla/targeting/gam360.html && \
	envsubst < ./publishers/www.lapresse.ca/index.html.tpl > ./publishers/www.lapresse.ca/index.html
