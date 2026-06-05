FROM nginx:1.20
WORKDIR /usr/share/nginx/html/

# Copy all demo files and assets
# Note: This copies ALL demos in the vanilla/ directory (including -node2, cross-site-test, prebid-rtd, etc.)
# Not all demos are necessarily linked from the index pages, but they're available if accessed directly
# Template files (.tpl) are excluded via .dockerignore
COPY --chmod=0444 ./vanilla/ ./vanilla/
COPY --chmod=0444 ./react/dist/ ./react/dist/
COPY --chmod=0444 ./index*.html ./
COPY --chmod=0444 ./css/ ./css/
COPY --chmod=0444 ./images/ ./images/
