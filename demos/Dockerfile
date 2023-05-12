FROM nginx:1.20
WORKDIR /usr/share/nginx/html/

COPY --chmod=0444 ./vanilla/targeting/gam360.html ./vanilla/targeting/gam360.html
COPY --chmod=0444 ./vanilla/targeting/gam360-cached.html ./vanilla/targeting/gam360-cached.html
COPY --chmod=0444 ./vanilla/targeting/prebid.html ./vanilla/targeting/prebid.html
COPY --chmod=0444 ./vanilla/targeting/prebid.js ./vanilla/targeting/prebid.js
COPY --chmod=0444 ./integration/lmpid-prebid-gpt.html ./integration/lmpid-prebid-gpt.html
COPY --chmod=0444 ./integration/lmpid-signal-gpt.html ./integration/lmpid-signal-gpt.html
COPY --chmod=0444 ./integration/prebid.js ./integration/prebid.js
COPY --chmod=0444 ./vanilla/identify.html ./vanilla/identify.html
COPY --chmod=0444 ./vanilla/profile.html ./vanilla/profile.html
COPY --chmod=0444 ./vanilla/witness.html ./vanilla/witness.html
COPY --chmod=0444 ./vanilla/nocookies/targeting/gam360.html ./vanilla/nocookies/targeting/gam360.html
COPY --chmod=0444 ./vanilla/nocookies/targeting/gam360-cached.html ./vanilla/nocookies/targeting/gam360-cached.html
COPY --chmod=0444 ./vanilla/nocookies/targeting/prebid.html ./vanilla/nocookies/targeting/prebid.html
COPY --chmod=0444 ./vanilla/nocookies/targeting/prebid.js ./vanilla/nocookies/targeting/prebid.js
COPY --chmod=0444 ./vanilla/nocookies/identify.html ./vanilla/nocookies/identify.html
COPY --chmod=0444 ./vanilla/nocookies/profile.html ./vanilla/nocookies/profile.html
COPY --chmod=0444 ./vanilla/nocookies/witness.html ./vanilla/nocookies/witness.html
COPY --chmod=0444 ./vanilla/uid2_token/index.html ./vanilla/uid2_token/index.html
COPY --chmod=0444 ./vanilla/uid2_token/login.html ./vanilla/uid2_token/login.html
COPY --chmod=0444 ./react/dist/ ./react/dist/
COPY --chmod=0444 ./index.html ./index.html
COPY --chmod=0444 ./index-nocookies.html ./index-nocookies.html
COPY --chmod=0444 ./css/ ./css/
COPY --chmod=0444 ./images/ ./images/
