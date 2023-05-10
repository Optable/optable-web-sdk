FROM nginx:1.20
WORKDIR /usr/share/nginx/html/

COPY --chown=nginx:nginx ./vanilla/targeting/gam360.html ./vanilla/targeting/gam360.html
COPY --chown=nginx:nginx ./vanilla/targeting/gam360-cached.html ./vanilla/targeting/gam360-cached.html
COPY --chown=nginx:nginx ./vanilla/targeting/prebid.html ./vanilla/targeting/prebid.html
COPY --chown=nginx:nginx ./vanilla/targeting/prebid.js ./vanilla/targeting/prebid.js
COPY --chown=nginx:nginx ./integration/lmpid-prebid-gpt.html ./integration/lmpid-prebid-gpt.html
COPY --chown=nginx:nginx ./integration/lmpid-signal-gpt.html ./integration/lmpid-signal-gpt.html
COPY --chown=nginx:nginx ./integration/prebid.js ./integration/prebid.js
COPY --chown=nginx:nginx ./vanilla/identify.html ./vanilla/identify.html
COPY --chown=nginx:nginx ./vanilla/profile.html ./vanilla/profile.html
COPY --chown=nginx:nginx ./vanilla/witness.html ./vanilla/witness.html
COPY --chown=nginx:nginx ./vanilla/nocookies/targeting/gam360.html ./vanilla/nocookies/targeting/gam360.html
COPY --chown=nginx:nginx ./vanilla/nocookies/targeting/gam360-cached.html ./vanilla/nocookies/targeting/gam360-cached.html
COPY --chown=nginx:nginx ./vanilla/nocookies/targeting/prebid.html ./vanilla/nocookies/targeting/prebid.html
COPY --chown=nginx:nginx ./vanilla/nocookies/targeting/prebid.js ./vanilla/nocookies/targeting/prebid.js
COPY --chown=nginx:nginx ./vanilla/nocookies/identify.html ./vanilla/nocookies/identify.html
COPY --chown=nginx:nginx ./vanilla/nocookies/profile.html ./vanilla/nocookies/profile.html
COPY --chown=nginx:nginx ./vanilla/nocookies/witness.html ./vanilla/nocookies/witness.html
COPY --chown=nginx:nginx ./vanilla/uid2_token/index.html ./vanilla/uid2_token/index.html
COPY --chown=nginx:nginx ./vanilla/uid2_token/login.html ./vanilla/uid2_token/login.html
COPY --chown=nginx:nginx ./react/dist/ ./react/dist/
COPY --chown=nginx:nginx ./index.html ./index.html
COPY --chown=nginx:nginx ./index-nocookies.html ./index-nocookies.html
COPY --chown=nginx:nginx ./css/ ./css/
COPY --chown=nginx:nginx ./images/ ./images/