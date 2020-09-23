
<!DOCTYPE html>
<html xml:lang="fr" lang="fr">

    <head>
        <title>LaPresse.ca | Actualités et Infos au Québec et dans le monde | La Presse</title>

<!-- Optable Web SDK script start -->
<script type="text/javascript">
  window.optableCommands = window.optableCommands || [];
  optableCommands.push(function () {
    window.optable = new optableSDK({
      host: "${SANDBOX_HOST}",
      site: "lapresse",
      insecure: JSON.parse("${SANDBOX_INSECURE}")
    });
  });
</script>
<script async src="${SDK_URI}" onload="window.optable.authenticator();"></script>
<!-- Optable Web SDK script end -->

<!-- Optable Authenticator customization markup start -->
<link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"/>
<link rel="stylesheet" type="text/css" href="/publishers/css/optable-login.css" media="all" />
<!-- Optable Authenticator customization markup end -->

        <!-- STANDARD META -->
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=1170, maximum-scale=1.0"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"><script type="text/javascript">(window.NREUM||(NREUM={})).loader_config={licenseKey:"b90eab036c",applicationID:"109615643"};window.NREUM||(NREUM={}),__nr_require=function(e,n,t){function r(t){if(!n[t]){var i=n[t]={exports:{}};e[t][0].call(i.exports,function(n){var i=e[t][1][n];return r(i||n)},i,i.exports)}return n[t].exports}if("function"==typeof __nr_require)return __nr_require;for(var i=0;i<t.length;i++)r(t[i]);return r}({1:[function(e,n,t){function r(){}function i(e,n,t){return function(){return o(e,[u.now()].concat(f(arguments)),n?null:this,t),n?void 0:this}}var o=e("handle"),a=e(4),f=e(5),c=e("ee").get("tracer"),u=e("loader"),s=NREUM;"undefined"==typeof window.newrelic&&(newrelic=s);var p=["setPageViewName","setCustomAttribute","setErrorHandler","finished","addToTrace","inlineHit","addRelease"],l="api-",d=l+"ixn-";a(p,function(e,n){s[n]=i(l+n,!0,"api")}),s.addPageAction=i(l+"addPageAction",!0),s.setCurrentRouteName=i(l+"routeName",!0),n.exports=newrelic,s.interaction=function(){return(new r).get()};var m=r.prototype={createTracer:function(e,n){var t={},r=this,i="function"==typeof n;return o(d+"tracer",[u.now(),e,t],r),function(){if(c.emit((i?"":"no-")+"fn-start",[u.now(),r,i],t),i)try{return n.apply(this,arguments)}catch(e){throw c.emit("fn-err",[arguments,this,e],t),e}finally{c.emit("fn-end",[u.now()],t)}}}};a("actionText,setName,setAttribute,save,ignore,onEnd,getContext,end,get".split(","),function(e,n){m[n]=i(d+n)}),newrelic.noticeError=function(e,n){"string"==typeof e&&(e=new Error(e)),o("err",[e,u.now(),!1,n])}},{}],2:[function(e,n,t){function r(e,n){var t=e.getEntries();t.forEach(function(e){"first-paint"===e.name?c("timing",["fp",Math.floor(e.startTime)]):"first-contentful-paint"===e.name&&c("timing",["fcp",Math.floor(e.startTime)])})}function i(e,n){var t=e.getEntries();t.length>0&&c("lcp",[t[t.length-1]])}function o(e){if(e instanceof s&&!l){var n,t=Math.round(e.timeStamp);n=t>1e12?Date.now()-t:u.now()-t,l=!0,c("timing",["fi",t,{type:e.type,fid:n}])}}if(!("init"in NREUM&&"page_view_timing"in NREUM.init&&"enabled"in NREUM.init.page_view_timing&&NREUM.init.page_view_timing.enabled===!1)){var a,f,c=e("handle"),u=e("loader"),s=NREUM.o.EV;if("PerformanceObserver"in window&&"function"==typeof window.PerformanceObserver){a=new PerformanceObserver(r),f=new PerformanceObserver(i);try{a.observe({entryTypes:["paint"]}),f.observe({entryTypes:["largest-contentful-paint"]})}catch(p){}}if("addEventListener"in document){var l=!1,d=["click","keydown","mousedown","pointerdown","touchstart"];d.forEach(function(e){document.addEventListener(e,o,!1)})}}},{}],3:[function(e,n,t){function r(e,n){if(!i)return!1;if(e!==i)return!1;if(!n)return!0;if(!o)return!1;for(var t=o.split("."),r=n.split("."),a=0;a<r.length;a++)if(r[a]!==t[a])return!1;return!0}var i=null,o=null,a=/Version\/(\S+)\s+Safari/;if(navigator.userAgent){var f=navigator.userAgent,c=f.match(a);c&&f.indexOf("Chrome")===-1&&f.indexOf("Chromium")===-1&&(i="Safari",o=c[1])}n.exports={agent:i,version:o,match:r}},{}],4:[function(e,n,t){function r(e,n){var t=[],r="",o=0;for(r in e)i.call(e,r)&&(t[o]=n(r,e[r]),o+=1);return t}var i=Object.prototype.hasOwnProperty;n.exports=r},{}],5:[function(e,n,t){function r(e,n,t){n||(n=0),"undefined"==typeof t&&(t=e?e.length:0);for(var r=-1,i=t-n||0,o=Array(i<0?0:i);++r<i;)o[r]=e[n+r];return o}n.exports=r},{}],6:[function(e,n,t){n.exports={exists:"undefined"!=typeof window.performance&&window.performance.timing&&"undefined"!=typeof window.performance.timing.navigationStart}},{}],ee:[function(e,n,t){function r(){}function i(e){function n(e){return e&&e instanceof r?e:e?c(e,f,o):o()}function t(t,r,i,o){if(!l.aborted||o){e&&e(t,r,i);for(var a=n(i),f=v(t),c=f.length,u=0;u<c;u++)f[u].apply(a,r);var p=s[y[t]];return p&&p.push([b,t,r,a]),a}}function d(e,n){h[e]=v(e).concat(n)}function m(e,n){var t=h[e];if(t)for(var r=0;r<t.length;r++)t[r]===n&&t.splice(r,1)}function v(e){return h[e]||[]}function g(e){return p[e]=p[e]||i(t)}function w(e,n){u(e,function(e,t){n=n||"feature",y[t]=n,n in s||(s[n]=[])})}var h={},y={},b={on:d,addEventListener:d,removeEventListener:m,emit:t,get:g,listeners:v,context:n,buffer:w,abort:a,aborted:!1};return b}function o(){return new r}function a(){(s.api||s.feature)&&(l.aborted=!0,s=l.backlog={})}var f="nr@context",c=e("gos"),u=e(4),s={},p={},l=n.exports=i();l.backlog=s},{}],gos:[function(e,n,t){function r(e,n,t){if(i.call(e,n))return e[n];var r=t();if(Object.defineProperty&&Object.keys)try{return Object.defineProperty(e,n,{value:r,writable:!0,enumerable:!1}),r}catch(o){}return e[n]=r,r}var i=Object.prototype.hasOwnProperty;n.exports=r},{}],handle:[function(e,n,t){function r(e,n,t,r){i.buffer([e],r),i.emit(e,n,t)}var i=e("ee").get("handle");n.exports=r,r.ee=i},{}],id:[function(e,n,t){function r(e){var n=typeof e;return!e||"object"!==n&&"function"!==n?-1:e===window?0:a(e,o,function(){return i++})}var i=1,o="nr@id",a=e("gos");n.exports=r},{}],loader:[function(e,n,t){function r(){if(!x++){var e=E.info=NREUM.info,n=d.getElementsByTagName("script")[0];if(setTimeout(s.abort,3e4),!(e&&e.licenseKey&&e.applicationID&&n))return s.abort();u(y,function(n,t){e[n]||(e[n]=t)}),c("mark",["onload",a()+E.offset],null,"api");var t=d.createElement("script");t.src="https://"+e.agent,n.parentNode.insertBefore(t,n)}}function i(){"complete"===d.readyState&&o()}function o(){c("mark",["domContent",a()+E.offset],null,"api")}function a(){return O.exists&&performance.now?Math.round(performance.now()):(f=Math.max((new Date).getTime(),f))-E.offset}var f=(new Date).getTime(),c=e("handle"),u=e(4),s=e("ee"),p=e(3),l=window,d=l.document,m="addEventListener",v="attachEvent",g=l.XMLHttpRequest,w=g&&g.prototype;NREUM.o={ST:setTimeout,SI:l.setImmediate,CT:clearTimeout,XHR:g,REQ:l.Request,EV:l.Event,PR:l.Promise,MO:l.MutationObserver};var h=""+location,y={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",agent:"js-agent.newrelic.com/nr-1169.min.js"},b=g&&w&&w[m]&&!/CriOS/.test(navigator.userAgent),E=n.exports={offset:f,now:a,origin:h,features:{},xhrWrappable:b,userAgent:p};e(1),e(2),d[m]?(d[m]("DOMContentLoaded",o,!1),l[m]("load",r,!1)):(d[v]("onreadystatechange",i),l[v]("onload",r)),c("mark",["firstbyte",f],null,"api");var x=0,O=e(6)},{}],"wrap-function":[function(e,n,t){function r(e){return!(e&&e instanceof Function&&e.apply&&!e[a])}var i=e("ee"),o=e(5),a="nr@original",f=Object.prototype.hasOwnProperty,c=!1;n.exports=function(e,n){function t(e,n,t,i){function nrWrapper(){var r,a,f,c;try{a=this,r=o(arguments),f="function"==typeof t?t(r,a):t||{}}catch(u){l([u,"",[r,a,i],f])}s(n+"start",[r,a,i],f);try{return c=e.apply(a,r)}catch(p){throw s(n+"err",[r,a,p],f),p}finally{s(n+"end",[r,a,c],f)}}return r(e)?e:(n||(n=""),nrWrapper[a]=e,p(e,nrWrapper),nrWrapper)}function u(e,n,i,o){i||(i="");var a,f,c,u="-"===i.charAt(0);for(c=0;c<n.length;c++)f=n[c],a=e[f],r(a)||(e[f]=t(a,u?f+i:i,o,f))}function s(t,r,i){if(!c||n){var o=c;c=!0;try{e.emit(t,r,i,n)}catch(a){l([a,t,r,i])}c=o}}function p(e,n){if(Object.defineProperty&&Object.keys)try{var t=Object.keys(e);return t.forEach(function(t){Object.defineProperty(n,t,{get:function(){return e[t]},set:function(n){return e[t]=n,n}})}),n}catch(r){l([r])}for(var i in e)f.call(e,i)&&(n[i]=e[i]);return n}function l(n){try{e.emit("internal-error",n)}catch(t){}}return e||(e=i),t.inPlace=u,t.flag=a,t}},{}]},{},["loader"]);</script>

        <meta name="description" content="Le site d&#039;information francophone le plus complet en Amérique du Nord: Actualités régionales, provinciales, nationales et internationales."/>
        <meta name="keywords" content="Actualités et Infos au Québec et dans le monde"/>
        <link rel="canonical" href="index.html" />
        <link rel="image_src" href="https://static.lpcdn.ca/lpweb/lapresse/img/lp_facebook_1.91x1.png" />
        <!-- /STANDARD META -->

        <!-- FB RELATED META -->
        <meta property="al:iphone:url" content="https://www.lapresse.ca/">
        <meta property="al:iphone:app_store_id" content= "451829003">
        <meta property="al:iphone:app_name" content="La Presse">
        <meta property="al:android:url" content="https://www.lapresse.ca/">
        <meta property="al:android:package" content= "ca.lapresse.android.lapressemobile">
        <meta property="al:android:app_name" content="La Presse">

        <meta property="og:type" content="article"/>
        <meta property="og:title" content="LaPresse.ca | Actualités et Infos au Québec et dans le monde"/>
        <meta property="og:description" content="Le site d&#039;information francophone le plus complet en Amérique du Nord: Actualités régionales, provinciales, nationales et internationales."/>
        <meta property="og:site_name" content="La Presse"/>
        <meta property="og:locale" content="fr_CA"/>
        <meta property="og:url" content="https://www.lapresse.ca/"/>

        <!-- /FB RELATED META -->

        <!-- TWITTER RELATED META -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@LP_LaPresse" />
        <meta name="twitter:title" content="LaPresse.ca | Actualités et Infos au Québec et dans le monde" />
        <meta name="twitter:description" content="Le site d&#039;information francophone le plus complet en Amérique du Nord: Actualités régionales, provinciales, nationales et internationales." />
        <meta name="twitter:image:src" content="https://static.lpcdn.ca/lpweb/lapresse/img/lp_facebook_1.91x1.png" />
        <!-- /TWITTER RELATED META -->

        <!-- Favicons -->
        <link rel="apple-touch-icon" sizes="57x57" href="https://www.lapresse.ca/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="https://www.lapresse.ca/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="https://www.lapresse.ca/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="https://www.lapresse.ca/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="https://www.lapresse.ca/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="https://www.lapresse.ca/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="https://www.lapresse.ca/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="https://www.lapresse.ca/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://www.lapresse.ca/apple-touch-icon-180x180.png" />

        <link rel="icon" type="image/png" href="https://www.lapresse.ca/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="https://www.lapresse.ca/android-chrome-192x192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="https://www.lapresse.ca/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="https://www.lapresse.ca/favicon-16x16.png" sizes="16x16" />
        <link rel="manifest" href="https://www.lapresse.ca/manifest.json" />
        <link rel="mask-icon" href="https://www.lapresse.ca/safari-pinned-tab.svg" color="#e12929" />
        <link rel="shortcut icon" href="favicon.ico" />
        <!-- /Favicons -->


        <!-- APPS RELATED META -->
        <meta property="fb:app_id" content="166995983353903"/>
        <meta property="fb:admins" content="100001148387127"/>

        <meta name="apple-itunes-app" content="app-id=451829003" />

        <meta name="msapplication-TileColor" content="#2b5797" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <!-- /APPS RELATED META -->

                    <meta property="og:image" content="https://static.lpcdn.ca/lpweb/lapresse/img/lp_facebook_1.91x1.png"/>
            <meta property="og:image:width" content="1203"/>
            <meta property="og:image:height" content="630"/>
        
        
        <script src="../static.lpcdn.ca/lpweb/common/scripts/advertisement.js"></script>
        <script>
            var __nuglif__webpack_public_path__ = 'https://static.lpcdn.ca/lpweb/dist/';
            var FIREBASE_CONFIG = {"authDomain":"la-presse-prod.firebaseapp.com","projectId":"la-presse-prod","appId":"1:503582292049:web:4222e0a5ecda30ec036070","apiKey":"AIzaSyDRtzD-EJvsMY_NX4L-wFL1tuMAyP8CvsU"};
        </script>

                    <script>
                var ngAppGlobals = Object.assign({
                    network: 21686484267,
                    topLevelAdUnit: 'LPCA',
                    adUnit: 'LPCA_homepage',
                    userAgent: navigator.userAgent,
                    location: window.location,
                    adsKeyValues: ["","actualites","international","affaires","sports","auto","arts","debats","cinema","techno","sciences","environnement","voyage","vivre","maison","vins","xtra","suite","detente","meteo","photos","videos","cpspecial","rmon1","noel","societe","gourmand","elections"],
                    pageAdsKeyValues: {
                        typePage: 'home',
                        pageView: 'desktop',
                    },
                }, {});
            </script>
        
            <script>var FLASHNEWS_ACTIVE_ENDPOINT_URL = "https://api.rb-fe.nuglif.net/flashnews/active"</script>
    <script src="../static.lpcdn.ca/lpweb/dist/js/appDesktop.bundle.86707d56b8f1612679e6.js"></script>
    <script src="../static.lpcdn.ca/lpweb/dist/js/homePage.bundle.cebe436f88e93e295793.js"></script>
    <script>var nuglif = nuglif['appDesktop'];</script>
    <script>
    window.dataLayer = [{
        'version': 2,
        'page': {
            'view': 'desktop',
            'type': 'home'
        },
        'user': {
            'loginId': nuglif.ngApp.user.loggedInUUID,
            'anonymousId': nuglif.ngApp.user.anonymousUUID,
            'isLoggedIn': nuglif.ngApp.user.isLoggedIn,
        },
        'browser': {
            'noBlocker': (window.noBlocker !== undefined && window.noBlocker)
        }
    }]
</script>

        <script>
        window.googlefc = window.googlefc || {};
        googlefc.controlledMessagingFunction = function (message) {
            var now = new Date();
            var last = window.localStorage.getItem('supportlpwithfunding');

            if (last && ((now - Date.parse(last)) < 1000 * 60 * 120)) {
                message.proceed(false);
            } else {
                window.localStorage.setItem('supportlpwithfunding', now);
                message.proceed(true);
            }
        };
    </script>
    <script src="https://contributor.google.com/scripts/7fb65fca809a5063/loader.js"></script><script>(function(){'use strict';var g=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}},l=this,m=/^[\w+/_-]+[=]{0,2}$/,p=null,q=function(){},r=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";
            if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},t=Date.now||function(){return+new Date},u=function(a,b){function c(){}c.prototype=b.prototype;a.m=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.j=function(d,e,f){for(var k=Array(arguments.length-2),h=2;h<arguments.length;h++)k[h-2]=arguments[h];return b.prototype[e].apply(d,
            k)}};var v=function(a,b){Object.defineProperty(l,a,{configurable:!1,get:function(){return b},set:q})};var w=function(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^t()).toString(36)};var y=function(){this.a="";this.b=x},x={},z=function(a){var b=new y;b.a=a;return b};var A=function(a,b){a.src=b instanceof y&&b.constructor===y&&b.b===x?b.a:"type_error:TrustedResourceUrl";if(null===p)b:{b=l.document;if((b=b.querySelector&&b.querySelector("script[nonce]"))&&(b=b.nonce||b.getAttribute("nonce"))&&m.test(b)){p=b;break b}p=""}b=p;b&&a.setAttribute("nonce",b)};var B=function(a){this.a=a||l.document||document};B.prototype.appendChild=function(a,b){a.appendChild(b)};var C=function(a,b,c,d,e,f){try{var k=a.a,h=a.a.createElement("SCRIPT");h.async=!0;A(h,b);k.head.appendChild(h);h.addEventListener("load",function(){e();d&&k.head.removeChild(h)});h.addEventListener("error",function(){0<c?C(a,b,c-1,d,e,f):(d&&k.head.removeChild(h),f())})}catch(n){f()}};var D=l.atob("aHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vaW1hZ2VzL2ljb25zL21hdGVyaWFsL3N5c3RlbS8xeC93YXJuaW5nX2FtYmVyXzI0ZHAucG5n"),E=l.atob("WW91IGFyZSBzZWVpbmcgdGhpcyBtZXNzYWdlIGJlY2F1c2UgYWQgb3Igc2NyaXB0IGJsb2NraW5nIHNvZnR3YXJlIGlzIGludGVyZmVyaW5nIHdpdGggdGhpcyBwYWdlLg=="),aa=l.atob("RGlzYWJsZSBhbnkgYWQgb3Igc2NyaXB0IGJsb2NraW5nIHNvZnR3YXJlLCB0aGVuIHJlbG9hZCB0aGlzIHBhZ2Uu"),ba=function(a,b,c){this.b=a;this.f=new B(this.b);this.a=null;this.c=[];this.g=!1;this.i=b;this.h=c},H=function(a){if(a.b.body&&!a.g){var b=
            function(){F(a);l.setTimeout(function(){return G(a,3)},50)};C(a.f,a.i,2,!0,function(){l[a.h]||b()},b);a.g=!0}},F=function(a){for(var b=I(1,5),c=0;c<b;c++){var d=J(a);a.b.body.appendChild(d);a.c.push(d)}b=J(a);b.style.bottom="0";b.style.left="0";b.style.position="fixed";b.style.width=I(100,110).toString()+"%";b.style.zIndex=I(2147483544,2147483644).toString();b.style["background-color"]=K(249,259,242,252,219,229);b.style["box-shadow"]="0 0 12px #888";b.style.color=K(0,10,0,10,0,10);b.style.display=
            "flex";b.style["justify-content"]="center";b.style["font-family"]="Roboto, Arial";c=J(a);c.style.width=I(80,85).toString()+"%";c.style.maxWidth=I(750,775).toString()+"px";c.style.margin="24px";c.style.display="flex";c.style["align-items"]="flex-start";c.style["justify-content"]="center";d=a.f.a.createElement("IMG");d.className=w();d.src=D;d.style.height="24px";d.style.width="24px";d.style["padding-right"]="16px";var e=J(a),f=J(a);f.style["font-weight"]="bold";f.textContent=E;var k=J(a);k.textContent=
            aa;L(a,e,f);L(a,e,k);L(a,c,d);L(a,c,e);L(a,b,c);a.a=b;a.b.body.appendChild(a.a);b=I(1,5);for(c=0;c<b;c++)d=J(a),a.b.body.appendChild(d),a.c.push(d)},L=function(a,b,c){for(var d=I(1,5),e=0;e<d;e++){var f=J(a);b.appendChild(f)}b.appendChild(c);c=I(1,5);for(d=0;d<c;d++)e=J(a),b.appendChild(e)},I=function(a,b){return Math.floor(a+Math.random()*(b-a))},K=function(a,b,c,d,e,f){return"rgb("+I(Math.max(a,0),Math.min(b,255)).toString()+","+I(Math.max(c,0),Math.min(d,255)).toString()+","+I(Math.max(e,0),Math.min(f,
            255)).toString()+")"},J=function(a){a=a.f.a.createElement("DIV");a.className=w();return a},G=function(a,b){0>=b||null!=a.a&&0!=a.a.offsetHeight&&0!=a.a.offsetWidth||(ca(a),F(a),l.setTimeout(function(){return G(a,b-1)},50))},ca=function(a){var b=a.c;var c="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];b=c?c.call(b):{next:g(b)};for(c=b.next();!c.done;c=b.next())(c=c.value)&&c.parentNode&&c.parentNode.removeChild(c);a.c=[];(b=a.a)&&b.parentNode&&b.parentNode.removeChild(b);a.a=null};var M=function(a,b,c){a=l.btoa(a+b);v(a,c)},da=function(a,b,c){for(var d=[],e=2;e<arguments.length;++e)d[e-2]=arguments[e];e=l.btoa(a+b);e=l[e];if("function"==r(e))e.apply(null,d);else throw Error("API not exported.");};var fa=function(a,b,c,d,e){var f=ea(c),k=function(n){n.appendChild(f);l.setTimeout(function(){f?(0!==f.offsetHeight&&0!==f.offsetWidth?b():a(),f.parentNode&&f.parentNode.removeChild(f)):a()},d)},h=function(n){document.body?k(document.body):0<n?l.setTimeout(function(){h(n-1)},e):b()};h(3)},ea=function(a){var b=document.createElement("div");b.className=a;b.style.width="1px";b.style.height="1px";b.style.position="absolute";b.style.left="-10000px";b.style.top="-10000px";b.style.zIndex="-10000";return b};var N=null;var O=function(){},P="function"==typeof Uint8Array,Q=function(a,b){a.b=null;b||(b=[]);a.l=void 0;a.f=-1;a.a=b;a:{if(b=a.a.length){--b;var c=a.a[b];if(!(null===c||"object"!=typeof c||"array"==r(c)||P&&c instanceof Uint8Array)){a.g=b-a.f;a.c=c;break a}}a.g=Number.MAX_VALUE}a.i={}},R=[],S=function(a,b){if(b<a.g){b+=a.f;var c=a.a[b];return c===R?a.a[b]=[]:c}if(a.c)return c=a.c[b],c===R?a.c[b]=[]:c},U=function(a,b){var c=T;a.b||(a.b={});if(!a.b[b]){var d=S(a,b);d&&(a.b[b]=new c(d))}return a.b[b]};
            O.prototype.h=P?function(){var a=Uint8Array.prototype.toJSON;Uint8Array.prototype.toJSON=function(){if(!N){N={};for(var b=0;65>b;b++)N[b]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b)}b=N;for(var c=[],d=0;d<this.length;d+=3){var e=this[d],f=d+1<this.length,k=f?this[d+1]:0,h=d+2<this.length,n=h?this[d+2]:0,ha=e>>2;e=(e&3)<<4|k>>4;k=(k&15)<<2|n>>6;n&=63;h||(n=64,f||(k=64));c.push(b[ha],b[e],b[k],b[n])}return c.join("")};try{return JSON.stringify(this.a&&this.a,V)}finally{Uint8Array.prototype.toJSON=
                a}}:function(){return JSON.stringify(this.a&&this.a,V)};var V=function(a,b){return"number"!=typeof b||!isNaN(b)&&Infinity!==b&&-Infinity!==b?b:String(b)};O.prototype.toString=function(){return this.a.toString()};var T=function(a){Q(this,a)};u(T,O);var W=function(a){Q(this,a)};u(W,O);var ia=function(a,b){this.g=new B(a);var c=U(b,11);c=z(S(c,4)||"");this.b=new ba(a,c,S(b,10));this.a=b;this.f=S(this.a,1);this.c=!1},X=function(a,b,c,d){b=new T(b?JSON.parse(b):null);b=z(S(b,4)||"");C(a.g,b,3,!1,c,function(){fa(function(){H(a.b);d(!1)},function(){d(!0)},S(a.a,12),S(a.a,5),S(a.a,3))})},ja=function(a){a.c||(M(a.f,"internal_api_load_with_sb",function(b,c,d){X(a,b,c,d)}),M(a.f,"internal_api_sb",function(){H(a.b)}),a.c=!0)};var Y=function(a){this.h=l.document;this.a=new ia(this.h,a);this.f=S(a,1);this.g=U(a,2);this.c=!1;this.b=a};Y.prototype.start=function(){try{ka(),ja(this.a),l.googlefc=l.googlefc||{},"callbackQueue"in l.googlefc||(l.googlefc.callbackQueue=[]),la(this)}catch(a){H(this.a.b)}};
            var ka=function(){var a=function(){if(!l.frames.googlefcPresent)if(document.body){var b=document.createElement("iframe");b.style.display="none";b.style.width="0px";b.style.height="0px";b.style.border="none";b.style.zIndex="-1000";b.style.left="-1000px";b.style.top="-1000px";b.name="googlefcPresent";document.body.appendChild(b)}else l.setTimeout(a,5)};a()},la=function(a){var b=t();X(a.a,a.g.h(),function(){var c;var d=a.f,e=l[l.btoa(d+"cached_js")];if(e){e=l.atob(e);e=parseInt(e,10);d=l.btoa(d+"cached_js").split(".");
                var f=l;d[0]in f||"undefined"==typeof f.execScript||f.execScript("var "+d[0]);for(;d.length&&(c=d.shift());)d.length?f[c]&&f[c]!==Object.prototype[c]?f=f[c]:f=f[c]={}:f[c]=null;c=Math.abs(b-e);c=1728E5>c?0:c}else c=-1;0!=c&&(da(a.f,"internal_api_sb"),Z(a,S(a.b,9)))},function(c){c?Z(a,S(a.b,7)):Z(a,S(a.b,8))})},Z=function(a,b){a.c||(a.c=!0,a=new l.XMLHttpRequest,a.open("GET",b,!0),a.send())};(function(a,b){l[a]=function(c){for(var d=[],e=0;e<arguments.length;++e)d[e-0]=arguments[e];l[a]=q;b.apply(null,d)}})("__475an521in8a__",function(a){"function"==typeof l.atob&&(a=l.atob(a),a=new W(a?JSON.parse(a):null),(new Y(a)).start())});}).call(this);

        window.__475an521in8a__("WyI3ZmI2NWZjYTgwOWE1MDYzIixbbnVsbCxudWxsLG51bGwsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2YvQUdTS1d4VzJsY3dXdk9pWllmOWxhRWl5R0pKUG5PN01WSHZmT2w3a1ZzTWNpYUYzZnQxclM5NzJwTDdhejJyV0xEblNfQkNSNHQ1RU4xUVhQX2Y2aUI1bCJdCiwyMCxudWxsLDEwMCxudWxsLCJodHRwczovL2Z1bmRpbmdjaG9pY2VzbWVzc2FnZXMuZ29vZ2xlLmNvbS9sL0FHU0tXeFg3d3Q0dGF6UXRYSkhVWXROOU9Gd3BnWW5BVzE0eHZlSW8ydm05a2REUW12UGhhQmtINmwxNWJ5TXVZb2FhUEFYeDM1REFxb0lLV21zQjV3UEc/YWJcdTAwM2QxIiwiaHR0cHM6Ly9mdW5kaW5nY2hvaWNlc21lc3NhZ2VzLmdvb2dsZS5jb20vbC9BR1NLV3hVa28ybnNVNS1sLUlRQjlLOTk4eExwV2l6bjZac2ZzZ3g3UUtOMm9rT0taOXZYZHFybkpuMkFudFF4THJRMnljTmxRVXd5aGVHYkhQN2dZV3FPP2FiXHUwMDNkMVx1MDAyNnNiZlx1MDAzZDEiLCJodHRwczovL2Z1bmRpbmdjaG9pY2VzbWVzc2FnZXMuZ29vZ2xlLmNvbS9sL0FHU0tXeFV3SXUyZmczNDhIU3oyR2ZReWllVmRjQjRTWl81dEFiYWs3bG1QSjAtWElVeVpRcjV0aUpHSjNSdzRqcTNoZkJqeEl5UkFJcFpmc3ZudHlXT2w/c2JmXHUwMDNkMiIsIk4yWmlOalZtWTJFNE1EbGhOVEEyTXdcdTAwM2RcdTAwM2QiLFtudWxsLG51bGwsbnVsbCwiaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vMGVtbi9mL3AvN2ZiNjVmY2E4MDlhNTA2My5qcz91c3FwXHUwMDNkQ0FNIl0KLCJkaXYtZ3B0LWFkIl0K");</script>



        <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script src="../static.lpcdn.ca/lpweb/script/sha1encoder.js"></script>
<script>
    var googletag = googletag || {};
    googletag.cmd = googletag.cmd || [];

    var adsUtils = {
        isArray: function (param) {
            if (!Array.isArray) {
                return Object.prototype.toString.call(param) === '[object Array]';
            } else {
                return Array.isArray(param);
            }
        },

        breakpoints: {
            mobile: [0, 0],
            lg: [1024, 200]
        },

        debug: function () {

            function findCurrentBreakPoint() {
                const sorted = Object.keys(adsUtils.breakpoints).sort((k1, k2) => (adsUtils.breakpoints[k2][0] - adsUtils.breakpoints[k1][0]));
                let i = 0;
                while (window.innerWidth < adsUtils.breakpoints[sorted[i]][0]) i++;
                return sorted[i];
            }

            document.querySelectorAll(".fakeAd").forEach(function (fa) { fa.parentElement.removeChild(fa) });

            document.querySelectorAll("[data-ads-meta]").forEach(function (script) {
                const meta = JSON.parse(script.getAttribute("data-ads-meta"));
                const slotId = script.getAttribute("data-name");

                const slot = document.querySelector("#" + slotId);
                if (slot) {
                    slot.style.position = "relative";


                    const fakeAds = document.createElement("div");

                    var availableDimensions = Array.isArray(meta.dimensions)
                        ? meta.dimensions
                        : meta.dimensions[findCurrentBreakPoint()];

                    if (slot.firstElementChild) {
                        fakeAds.style.position = "absolute";
                        fakeAds.style.top = "30px";
                        availableDimensions = [[parseInt(slot.firstElementChild.style.width, 10), parseInt(slot.firstElementChild.style.height, 10)]];
                    }


                    if (availableDimensions.length) {
                        const fakeAdDimension = availableDimensions[Math.floor(Math.random() * availableDimensions.length)];

                        slot.style.display = "block";
                        slot.parentElement.parentElement.classList.remove("isEmpty");

                        fakeAds.style.opacity = 0.7;
                        fakeAds.style.width = fakeAdDimension[0] + "px";
                        fakeAds.style.height = fakeAdDimension[1] + "px";
                        fakeAds.style.backgroundImage = "url(http://via.placeholder.com/" + fakeAdDimension[0] + "x" + fakeAdDimension[1] + ")";
                        fakeAds.classList.add("fakeAd");
                        fakeAds.innerHTML = "position : " + meta.position + " | pageBlock : " + meta.pageBlock + "<br />dimensions : " + JSON.stringify(meta.dimensions);
                        slot.appendChild(fakeAds);
                    }

                }
            })
        }
    };

    googletag.cmd.push(function () {

        // deprecated - used by page that do not implement new layouts
        nuglif.ngApp.globals.storyAdsKeyValues && Object.keys(nuglif.ngApp.globals.storyAdsKeyValues).map(function(key) {
            googletag.pubads().setTargeting(key, nuglif.ngApp.globals.storyAdsKeyValues[key]);
        });

        // deprecated - used by page that do not implement new layouts
        nuglif.ngApp.globals.sectionAdsKeyValues && Object.keys(nuglif.ngApp.globals.sectionAdsKeyValues).map(function(key) {
            googletag.pubads().setTargeting(key, nuglif.ngApp.globals.sectionAdsKeyValues[key]);
        });


        nuglif.ngApp.globals.adsKeyValues && Object.keys(nuglif.ngApp.globals.adsKeyValues).map(function(key) {
            googletag.pubads().setTargeting(key, nuglif.ngApp.globals.adsKeyValues[key]);
        });

        nuglif.ngApp.globals.pageAdsKeyValues && Object.keys(nuglif.ngApp.globals.pageAdsKeyValues).map(function(key) {
            googletag.pubads().setTargeting(key, nuglif.ngApp.globals.pageAdsKeyValues[key]);
        });

        var hashedId = new SHA1Encoder().encode(nuglif.ngApp.globals.userId);
        googletag.pubads().setTargeting('userId', hashedId);
        googletag.pubads().setPublisherProvidedId(hashedId);
        googletag.pubads().setCentering(true);
        googletag.pubads().collapseEmptyDivs();

        googletag.pubads().enableLazyLoad({
            fetchMarginPercent: 25,
            renderMarginPercent: 10,
            mobileScaling: 2.0
        });

        googletag.pubads().addEventListener('slotRenderEnded', function(event) {
            const shouldDisplayEventEmitterSlot = function (event) {
                if(event.size !== null && event.size[0] === 7 && event.size[1] === 1){
                    return false
                }

                return !event.isEmpty;
            }


            if(shouldDisplayEventEmitterSlot(event)){

                const slot = event.slot;
                document.getElementById(slot.getSlotElementId()).parentNode.parentNode.classList.remove("isEmpty");
                document.getElementById(slot.getSlotElementId()).parentNode.classList.add("tagPublicite");

            }

            var renderedEvent = new CustomEvent("rendered", { "bubbles":true, "detail": {"displayed": shouldDisplayEventEmitterSlot(event) }});
            document.getElementById(event.slot.getSlotElementId()).dispatchEvent(renderedEvent);

        });

        googletag.enableServices();
    });
</script>

        <!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MP8JVMP');</script>
<!-- End Google Tag Manager -->


        
<script type="text/javascript">

    (function () {
        var panelDisplayedAtTime;

        window._sp_ = window._sp_ || {};
        window._sp_.config = window._sp_.config || {};

        window._sp_.config.account_id = 1057;
        window._sp_.config.content_control_callback = function () {};

        window._sp_.config.fsm_endpoint = "//fsm.lapresse.ca";
        window._sp_.config.enable_fsm_detection = true;
        window._sp_.config.enable_fsm_network_detection = true;

                window._sp_.config.mms_domain = 'lapresse-ca.lapresse.ca';

                window._sp_.mms = window._sp_.mms || {};
        window._sp_.mms.cmd = window._sp_.mms.cmd || [];

        window._sp_.config.mms_client_data_callback = function (contextData) {
            var sp_tracker = new Image();
            var sp_tracker_url = "https://d3q7vxy7usqoub.cloudfront.net?s_id=4680&a_id=1057&m_id=12345&r=" + Math.random()*1000;
            sp_tracker.src = sp_tracker_url;

            startTime = panelDisplayedAtTime = new Date();
            window.dataLayer.push({
                "event": "abMessageDisplayed",
                'abMessageDisplayed': {
                    active: contextData.d.abp,
                    whitelistEngaged: contextData.o.wl,
                    optedInRecovery: contextData.o.oir,
                    uuid: contextData.u.uuid,
                    bucket: contextData.u.bucket,
                    campaignId: contextData.info.cmpgn_id,
                    partitionUuid: contextData.info.prtn_uuid,
                    messageId: contextData.info.msg_id,
                    messageDesc: contextData.info.msg_desc,
                    pageType: ngAppGlobals.pageAdsKeyValues.typePage,
                    pageView: ngAppGlobals.pageAdsKeyValues.pageView,
                }
            })
        };

        window._sp_.config.mms_choice_selected_callback = function (choiceId) {
            var deltaTime = (new Date()).getTime() - panelDisplayedAtTime.getTime();
            window.dataLayer.push({
                "event": "abMessageSelected",
                "abMessageSelected": {
                    "choiceId": choiceId,
                    "displayedMessageDuration": deltaTime
                }
            })
        };

        window._sp_.mms.cmd.push(function () {
            window._sp_.mms.setTargeting( "pageType" , ngAppGlobals.pageAdsKeyValues.typePage );
            window._sp_.mms.setTargeting( "pageView" , ngAppGlobals.pageAdsKeyValues.pageView );
        });

                window._sp_.mms.cmd.push(function () {
            window._sp_.mms.startMsg();
        });

    })()
</script>

<script type="text/javascript" src="../static.lpcdn.ca/lpweb/common/scripts/m-lapresse.lapresse.js"></script>



        <style>
            html {
                font-family: Rubrik, Arial, Sans-Serif
            }

            h1, h2, h3 {
                font-family: Verlag, Arial, Helvetica, sans-serif;
            }
        </style>

        <!-- CSS SPÉCIFIQUES -->
            <link rel="stylesheet" type="text/css" href="../static.lpcdn.ca/lpweb/dist/css/homePage.bundle.4b57e6e546c982c5d2ec.css"/>
        <!-- /CSS SPÉCIFIQUES -->

        

        
    </head>

    <body class="pageView__desktop " itemscope itemtype="https://schema.org/WebPage" data-lazy-module="genericLayout">

        
        <header id="mainHeader">
            <nav class="navigation mainNav" data-location="mainNav" data-target-type="undefined">
    <div class="mainNav__header">
        <div class="mainNav__header__item">
            <a href="index.html">
                <img class="mainNav__logo" src="../static.lpcdn.ca/lpweb/mobile/img/la-presse-logo-web.svg" alt="La Presse">
            </a>
            <div class="mainNav__date">Aujourd’hui, lundi 6 juillet 2020</div>
        </div>
            <div class="mainNav__header__item">
        
        <div class="weatherWidget ">
            <a  href="https://www.lapresse.ca/meteo/ville/montreal_caqc0363.php">
                <span class="weatherWidget__city">Montréal</span>
                <span class="weatherWidget__weatherIcon"><img alt="météo Montréal" src="../static.lpcdn.ca/lpweb/lapresse/img/meteo/icone_une/c.png"/></span>
                <span class="weatherWidget__temperature">29&deg;C</span>
            </a>
        </div>
    </div>

        <div class="mainNav__header__item">

            <div class="mainNav__social">
                <div class="mainNav__social__title">Suivez La Presse</div>

                <ul class="socials">
                    <li class="socials_item">
                        <a class="mainNav__social_icon socials__icon socials-facebook" href="https://fr-ca.facebook.com/LaPresseFB/" title="Suivre La Presse sur Facebook" target="_blank" rel="noopener">&nbsp;</a>
                    </li>
                    <li class="socials_item">
                        <a class="mainNav__social_icon socials__icon socials-twitter" href="https://twitter.com/lp_lapresse" title="Suivre La Presse sur Twitter" target="_blank" rel="noopener">&nbsp;</a>
                    </li>
                    <li class="socials_item">
                        <a class="mainNav__social_icon socials__icon socials-linkedIn" href="https://ca.linkedin.com/company/la-presse" data-network="linkedIn" title="Partager sur LinkedIn" target="_blank" rel="noopener">&nbsp;</a>
                    </li>
                    <li class="socials_item">
                        <a class="mainNav__social_icon socials__icon socials-instagram" href="https://www.instagram.com/lp_lapresse/?hl=fr-ca" title="Suivre La Presse sur Instagram" target="_blank" rel="noopener">&nbsp;</a>
                    </li>
                    <li class="socials_item">
                        <a class="mainNav__social_icon socials__icon socials-pinterest" href="https://www.pinterest.ca/lplapresse" title="Suivre La Presse sur Pinterest" target="_blank" rel="noopener">&nbsp;</a>
                    </li>
                </ul>

            </div>
            <a
                data-target-type="contribution"
                class="btnContribution mainNav__contribution"
                href="https://jesoutiens.lapresse.ca/contribuer?utm_campaign=jesoutiens&amp;utm_source=lpca&amp;utm_medium=boutonSectionAccueil"
                target="_blank"
                rel="noopener">
                Je soutiens La Presse
            </a>

        </div>
    </div>

    <nav class="mainNav__section">
        <ul class="mainNav__sections">
            <li class="mainNav__sectionItem mainNav__logoItem">
                <a class="mainNav__sectionLink mainNav__LogoLink" href="index.html">
                    <img class="mainNav__section__logo" src="../static.lpcdn.ca/lpweb/mobile/img/la-presse-logo-web.svg" alt="La Presse">
                </a>
            </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--ACT  " href="https://www.lapresse.ca/actualites/">
                        Actualités
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--INT  " href="https://www.lapresse.ca/international/">
                        International
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--DEB  " href="https://www.lapresse.ca/debats/">
                        Débats
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--AFF  " href="https://www.lapresse.ca/affaires/">
                        Affaires
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--SPO  " href="https://www.lapresse.ca/sports/">
                        Sports
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--AUT  " href="https://www.lapresse.ca/auto/">
                        Auto
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--ART  " href="https://www.lapresse.ca/arts/">
                        Arts
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--CIN  " href="https://www.lapresse.ca/cinema/">
                        Cinéma
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--SOC  " href="https://www.lapresse.ca/societe/">
                        Société
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--GOU  " href="https://www.lapresse.ca/gourmand/">
                        Gourmand
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--VOY  " href="https://www.lapresse.ca/voyage/">
                        Voyage
                    </a>
                </li>
                            <li class="mainNav__sectionItem" data-target-type="section">
                    <a class="mainNav__sectionLink mainNav__sectionLink--withBar mainNav__sectionLink--MAI  " href="https://www.lapresse.ca/maison/">
                        Maison
                    </a>
                </li>
                        <li class="mainNav__sectionItem mainNav__searchItem">
                <span class="mainNav__sectionLink mainNav__searchLink">&nbsp;</span>
                <form class="mainNav__searchMenu" action="https://www.lapresse.ca/recherche" method="get">
                    <label>
                        <input class="mainNav__search__input" autocomplete="off" type="text" name="q" placeholder="Recherche Google" />
                    </label>
                    <input class="mainNav__search__btnSubmit" type="submit" value="">
                </form>
            </li>
            <li class="mainNav__sectionItem mainNav__userAccountItem">
                <div class="userAccountWidget">
    <span class="userAccountWidget__link"></span>
    <div class="userAccountWidget__popin">
                    <span class="userAccountWidget__title userAccountWidget__notLoggedIn">Votre compte La Presse</span>
            <span class="userAccountWidget__email userAccountWidget__loggedIn"></span>
            <ul class="userAccountWidget__btns">
                <li class="userAccountWidget__btn userAccountWidget__notLoggedIn"><a href="https://jesoutiens.lapresse.ca/mon-compte" target="_blank">Gérer mes contributions</a></li>
                                <li class="userAccountWidget__btn userAccountWidget__loggedIn"><a href="https://jesoutiens.lapresse.ca/mon-compte">Mon profile</a></li>
                <li class="userAccountWidget__btn userAccountWidget__signOut userAccountWidget__loggedIn"><a data-tracking="false" href="index.html">Se déconnecter</a></li>
            </ul>
            </div>
</div>

            </li>
        </ul>
    </nav>
            <nav class="mainNav__subSection mainNav__subSection--">
            <ul
                class="mainNav__subSections"
                data-target-type="section">
                                                                </ul>
        </nav>
    </nav>

<nav class="burger" data-location="mainNav" data-target-type="undefined" data-lazy-module="mobileNavigation">
    <div class="burger__menu">
        <div class="burger__menu__top">
            <a href="index.html" class="burger__menu__logo">
                <img src="../static.lpcdn.ca/lpweb/mobile/img/la-presse-logo-web.svg" alt="La Presse">
            </a>
            <a href="https://jesoutiens.lapresse.ca/contribuer?utm_campaign=jesoutiens&utm_source=lpca&utm_medium=boutonSectionAccueil"
               class="burger__menu__contribution"
               target="_blank"
               rel="noopener">
                Je soutiens La Presse
            </a>
        </div>
        <ul data-target-type="section" class="burger__sections">
                            <li class="ACT ">
                    <span class="burger__sections__item">
                        Actualités
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/actualites/" title="Actualités">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/national/" title="National">
                                    National
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/politique/" title="Politique">
                                    Politique
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/grand-montreal/" title="Grand Montréal">
                                    Grand Montréal
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/regional/" title="Régional">
                                    Régional
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/" title="Justice et faits divers">
                                    Justice et faits divers
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/sante/" title="Santé">
                                    Santé
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/education/" title="Éducation">
                                    Éducation
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/enquetes/" title="Enquêtes">
                                    Enquêtes
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/insolite/" title="Insolite">
                                    Insolite
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/environnement/" title="Environnement">
                                    Environnement
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/actualites/sciences/" title="Sciences">
                                    Sciences
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="INT ">
                    <span class="burger__sections__item">
                        International
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/international/" title="International">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/afrique/" title="Afrique">
                                    Afrique
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/amerique-latine/" title="Amérique latine">
                                    Amérique latine
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/asie-et-oceanie/" title="Asie et Océanie">
                                    Asie et Océanie
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/caraibes/" title="Caraïbes">
                                    Caraïbes
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/etats-unis/" title="États-Unis">
                                    États-Unis
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/europe/" title="Europe">
                                    Europe
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/international/moyen-orient/" title="Moyen-Orient">
                                    Moyen-Orient
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="DEB ">
                    <span class="burger__sections__item">
                        Débats
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/debats/" title="Débats">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/debats/editoriaux/" title="Éditoriaux">
                                    Éditoriaux
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/debats/opinions/" title="Opinions">
                                    Opinions
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/debats/courrier-des-lecteurs/" title="Courrier des lecteurs">
                                    Courrier des lecteurs
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/debats/caricatures/" title="Caricatures">
                                    Caricatures
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="AFF ">
                    <span class="burger__sections__item">
                        Affaires
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/affaires/" title="Affaires">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/economie/" title="Économie">
                                    Économie
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/marches/" title="Marchés">
                                    Marchés
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/entreprises/" title="Entreprises">
                                    Entreprises
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/techno/" title="Techno">
                                    Techno
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/medias/" title="Médias">
                                    Médias
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/finances-personnelles/" title="Finances personnelles">
                                    Finances personnelles
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/pme/" title="PME">
                                    PME
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/portfolio/" title="Portfolio">
                                    Portfolio
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/affaires/tetes-daffiche/" title="Têtes d&#039;affiche">
                                    Têtes d&#039;affiche
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="SPO ">
                    <span class="burger__sections__item">
                        Sports
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/sports/" title="Sports">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/hockey/" title="Hockey">
                                    Hockey
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/tokyo-2020/" title="Tokyo 2020">
                                    Tokyo 2020
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/soccer/" title="Soccer">
                                    Soccer
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/football/" title="Football">
                                    Football
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/tennis/" title="Tennis">
                                    Tennis
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/baseball/" title="Baseball">
                                    Baseball
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/course-automobile/" title="Course automobile">
                                    Course automobile
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/golf/" title="Golf">
                                    Golf
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/sports-de-combat/" title="Sports de combat">
                                    Sports de combat
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/sports-dhiver/" title="Sports d&#039;hiver">
                                    Sports d&#039;hiver
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/basketball/" title="Basketball">
                                    Basketball
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/cyclisme/" title="Cyclisme">
                                    Cyclisme
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/sports/balados/" title="Balados">
                                    Balados
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="AUT ">
                    <span class="burger__sections__item">
                        Auto
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/auto/" title="Auto">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/auto/guide-auto/" title="Guide auto">
                                    Guide auto
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/auto/voitures-electriques/" title="Voitures électriques">
                                    Voitures électriques
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/auto/trucs-et-conseils/" title="Trucs et conseils">
                                    Trucs et conseils
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/auto/rappels/" title="Rappels">
                                    Rappels
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="ART ">
                    <span class="burger__sections__item">
                        Arts
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/arts/" title="Arts">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/musique/" title="Musique">
                                    Musique
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/television/" title="Télévision">
                                    Télévision
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/theatre/" title="Théâtre">
                                    Théâtre
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/litterature/" title="Littérature">
                                    Littérature
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/arts-visuels/" title="Arts visuels">
                                    Arts visuels
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/spectacles/" title="Spectacles">
                                    Spectacles
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/humour/" title="Humour">
                                    Humour
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/arts/celebrites/" title="Célébrités">
                                    Célébrités
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="CIN ">
                    <span class="burger__sections__item">
                        Cinéma
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/cinema/" title="Cinéma">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/cinema/entrevues/" title="Entrevues">
                                    Entrevues
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/cinema/critiques/" title="Critiques">
                                    Critiques
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="SOC ">
                    <span class="burger__sections__item">
                        Société
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/societe/" title="Société">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/societe/sante/" title="Santé">
                                    Santé
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/societe/famille/" title="Famille">
                                    Famille
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/societe/mode-et-beaute/" title="Mode et beauté">
                                    Mode et beauté
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/societe/sexualite/" title="Sexualité">
                                    Sexualité
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/societe/animaux/" title="Animaux">
                                    Animaux
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="GOU ">
                    <span class="burger__sections__item">
                        Gourmand
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/gourmand/" title="Gourmand">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/gourmand/alimentation/" title="Alimentation">
                                    Alimentation
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/gourmand/recettes/" title="Recettes">
                                    Recettes
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/gourmand/restaurants/" title="Restaurants">
                                    Restaurants
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/gourmand/alcools/" title="Alcools">
                                    Alcools
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="VOY ">
                    <span class="burger__sections__item">
                        Voyage
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/voyage/" title="Voyage">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/quebec-et-canada/" title="Québec et Canada">
                                    Québec et Canada
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/etats-unis/" title="États-Unis">
                                    États-Unis
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/europe/" title="Europe">
                                    Europe
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/asie/" title="Asie">
                                    Asie
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/amerique-latine/" title="Amérique latine">
                                    Amérique latine
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/caraibes/" title="Caraïbes">
                                    Caraïbes
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/afrique/" title="Afrique">
                                    Afrique
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/oceanie/" title="Océanie">
                                    Océanie
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/trucs-et-conseils/" title="Trucs et conseils">
                                    Trucs et conseils
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/voyage/plein-air/" title="Plein air">
                                    Plein air
                                </a>
                            </li>
                                            </ul>
                </li>
                            <li class="MAI ">
                    <span class="burger__sections__item">
                        Maison
                    </span>
                    <ul class="burger__subSections">
                        <li class="">
                            <a href="https://www.lapresse.ca/maison/" title="Maison">
                                Tous
                            </a>
                        </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/maison/immobilier/" title="Immobilier">
                                    Immobilier
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/maison/architecture/" title="Architecture">
                                    Architecture
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/maison/decoration/" title="Décoration">
                                    Décoration
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/maison/renovation/" title="Rénovation">
                                    Rénovation
                                </a>
                            </li>
                                                    <li class="">
                                <a href="https://www.lapresse.ca/maison/cour-et-jardin/" title="Cour et jardin">
                                    Cour et jardin
                                </a>
                            </li>
                                            </ul>
                </li>
                    </ul>
    </div>
    <div class="burger__closePane"
         data-toggle-class="burgerNavOpen"
         data-toggle-class-target="body"
    ></div>
    <button class="burger__showMenu"
       data-toggle-class="burgerNavOpen"
       data-toggle-class-target="body"
    >
        &nbsp;
    </button>
    <a href="index.html" class="burger__logo">
        <img src="../static.lpcdn.ca/lpweb/mobile/img/logo-lp-line.svg" alt="La Presse">
    </a>

    <div class="burger__userAccount">
        <div class="userAccountWidget">
    <span class="userAccountWidget__link"></span>
    <div class="userAccountWidget__popin">
                    <span class="userAccountWidget__title userAccountWidget__notLoggedIn">Votre compte La Presse</span>
            <span class="userAccountWidget__email userAccountWidget__loggedIn"></span>
            <ul class="userAccountWidget__btns">
                <li class="userAccountWidget__btn userAccountWidget__notLoggedIn"><a href="https://jesoutiens.lapresse.ca/mon-compte" target="_blank">Gérer mes contributions</a></li>
                                <li class="userAccountWidget__btn userAccountWidget__loggedIn"><a href="https://jesoutiens.lapresse.ca/mon-compte">Mon profile</a></li>
                <li class="userAccountWidget__btn userAccountWidget__signOut userAccountWidget__loggedIn"><a data-tracking="false" href="index.html">Se déconnecter</a></li>
            </ul>
            </div>
</div>

    </div>
</nav>

        <div class="mainNav__header__item">
        
        <div class="weatherWidget weatherWidget--mobile">
            <a  href="https://www.lapresse.ca/meteo/ville/montreal_caqc0363.php">
                <span class="weatherWidget__city">Montréal</span>
                <span class="weatherWidget__weatherIcon"><img alt="météo Montréal" src="../static.lpcdn.ca/lpweb/lapresse/img/meteo/icone_une/c.png"/></span>
                <span class="weatherWidget__temperature">29&deg;C</span>
            </a>
        </div>
    </div>



        </header>

        <div
            class="webpart"
            data-webpart-type="admin"
            data-webpart-validate-crayon="true"
            data-webpart-url="/ops/webpart/admin">
        </div>

        
            <div class="homeRow pageBlock--emplacement-homePageHeaderAd">
            <div class="adsWrapper">
                <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2a2c9a-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2a2c9a-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2a2c9a-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos1"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2a2c9a-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2a2c9a-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[],"lg":[[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "header")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2a2c9a-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'header', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

            </div>
        </div>
        <div data-sticky-menu-trigger></div>
    
    <div class="flashnews display-none">
    <div class="flashnews__heading">dernière heure</div>
    <div class="flashnews__content">
        <h3 class="flashnews__title"></h3>
        <p class="flashnews__body"></p>
    </div>
</div>


    <div class="homeRow homeRow--no-margin" data-lazy-module="homeStats">
        <div class="editorsChoiceHeadlines pageBlock--emplacement-homePageEditorsChoicePos1" data-location="home-donotmiss">
            
<ul class="editorsChoiceHeadlines__horizontalList">
    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-1
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-SPO
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="da4887836735338687b8b72a00cc1dbb"
            data-target-legacy-id="5280514"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/da4887836735338687b8b72a00cc1dbb">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" class="editorsChoiceCard__cover" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg" alt=" Price, Weber et Gallagher sur la patinoire à Brossard)"/>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:36</span>
</span>

                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                        Price, Weber et Gallagher sur la patinoire à Brossard
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 17h51</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 18h50</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-2
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-SOC
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="b50ffc73ed6338d4acea2c38a9eee0e2"
            data-target-legacy-id="5280389"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/b50ffc73ed6338d4acea2c38a9eee0e2">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" class="editorsChoiceCard__cover" title="Les camps de vacances, icônes culturelles">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg" alt=" Les camps de vacances, icônes culturelles)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles">
                        Les camps de vacances, icônes culturelles
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-3
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-MAI
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="4037cd7d08ab3c1180b802ab64eb8012"
            data-target-legacy-id="5280459"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/12/4037cd7d08ab3c1180b802ab64eb8012">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" class="editorsChoiceCard__cover" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg" alt=" Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-MAI"></div>
                <div class="sectionDash sectionDash--section-MAI"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                        Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-4
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-VOY
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="165093471d36346e9f02d757cd4d701e"
            data-target-legacy-id="5280384"
            data-position="4"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/11/165093471d36346e9f02d757cd4d701e">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" class="editorsChoiceCard__cover" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg" alt=" Gérard Bodard et Richard Chartrand: les rois des Zingues)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-VOY"></div>
                <div class="sectionDash sectionDash--section-VOY"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                        Gérard Bodard et Richard Chartrand: les rois des Zingues
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

</ul>

        </div>
    </div>

    <hr />

    <div class="mainHeadlines homeRow homeHeadlinesRow homeHeadlinesRow--displayMode-default">
        <div class="pageBlock--emplacement-homePageMainHeadlines">
                            

<div class="homeHeadlinesRow__main homeHeadlinesRow__main--displayMode-default" data-lazy-module="homeStats" data-location="home-headlines">
    <h1 class="header header--displayMode-default">
        Les grands titres
    </h1>
        <ul class="homeHeadlines homeHeadlines--displayMode-default">
                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeHeadlinesCard
                homeHeadlinesCard--size-big
                homeHeadlinesCard--section-SPO
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="7848f4d00f4a3c46a36c04f4a70f13fd"
            data-target-legacy-id="5280517"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/7848f4d00f4a3c46a36c04f4a70f13fd">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" class="homeHeadlinesCard__cover" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août">
                                    <img src="../mobile-img.lpcdn.ca/lpca/924x/r3996/0d121656-bfd6-11ea-b33c-02fe89184577.jpg" alt=" Entente entre la LNH et les joueurs: des matchs dès le 1er août)"/>
                                            </a>
                            <div class="homeHeadlinesCard__blurredOverlay">
                    <img alt=" Entente entre la LNH et les joueurs: des matchs dès le 1er août)" src="../mobile-img.lpcdn.ca/lpca/924x/r3996/0d121656-bfd6-11ea-b33c-02fe89184577.jpg"/>
                </div>
                        <div class="homeHeadlinesCard__details homeHeadlinesCard__details--overlay">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août">
                        Entente entre la LNH et les joueurs: des matchs dès le 1<sup>er </sup>août
                    </a>
                </h2>
                                    <p class="homeHeadlinesCard__lead "><a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août">La LNH et l’Association des joueurs ont annoncé avoir conclu une entente touchant à la fois la reprise des activités cet été et une prolongation de la convention...</a></p>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 18h16</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeHeadlinesCard
                homeHeadlinesCard--size-medium
                homeHeadlinesCard--section-ACT
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d49a500fed623128a4bccaac99a7f3c9"
            data-target-legacy-id="5280503"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/d49a500fed623128a4bccaac99a7f3c9">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/montreal-va-rendre-le-masque-obligatoire-dans-les-lieux-publics-fermes.php" class="homeHeadlinesCard__cover" title="Montréal va rendre le masque obligatoire dans les lieux publics fermés">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/c5dbc9ae/b7bdb0e1-bfcc-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/c5dbc9ae/b7bdb0e1-bfcc-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/c5dbc9ae/b7bdb0e1-bfcc-11ea-b33c-02fe89184577.jpg" alt=" Montréal va rendre le masque obligatoire dans les lieux publics fermés)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:07</span>
</span>

                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/montreal-va-rendre-le-masque-obligatoire-dans-les-lieux-publics-fermes.php" title="Montréal va rendre le masque obligatoire dans les lieux publics fermés"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/montreal-va-rendre-le-masque-obligatoire-dans-les-lieux-publics-fermes.php" title="Montréal va rendre le masque obligatoire dans les lieux publics fermés">
                        Montréal va rendre le masque obligatoire dans les lieux publics fermés
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 16h10</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 17h10</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeHeadlinesCard
                homeHeadlinesCard--size-medium
                homeHeadlinesCard--section-ACT
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="ef7430c671783e888b163515e537100c"
            data-target-legacy-id="5280489"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/ef7430c671783e888b163515e537100c">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/l-intrus-arme-a-rideau-hall-aurait-menace-justin-trudeau.php" class="homeHeadlinesCard__cover" title="L’intrus armé à Rideau Hall aurait menacé Justin Trudeau ">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/e4e41786-bfb1-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/e4e41786-bfb1-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/e4e41786-bfb1-11ea-b33c-02fe89184577.jpg" alt=" L’intrus armé à Rideau Hall aurait menacé Justin Trudeau )">
                    </picture>
                                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/l-intrus-arme-a-rideau-hall-aurait-menace-justin-trudeau.php" title="L’intrus armé à Rideau Hall aurait menacé Justin Trudeau "></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/l-intrus-arme-a-rideau-hall-aurait-menace-justin-trudeau.php" title="L’intrus armé à Rideau Hall aurait menacé Justin Trudeau ">
                        L’intrus armé à Rideau Hall aurait menacé Justin Trudeau 
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 13h57</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 16h16</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-4
                homeHeadlinesCard
                homeHeadlinesCard--size-medium
                homeHeadlinesCard--section-AFF
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="bf016716d55a38748e42b3ec3fe8fc72"
            data-target-legacy-id="5280510"
            data-position="4"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/bf016716d55a38748e42b3ec3fe8fc72">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" class="homeHeadlinesCard__cover" title="Le Cirque du Soleil invite ses créanciers aux enchères">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/4118bbc2-bfcd-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/4118bbc2-bfcd-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4118bbc2-bfcd-11ea-b33c-02fe89184577.jpg" alt=" Le Cirque du Soleil invite ses créanciers aux enchères)">
                    </picture>
                                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" title="Le Cirque du Soleil invite ses créanciers aux enchères"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" title="Le Cirque du Soleil invite ses créanciers aux enchères">
                        Le Cirque du Soleil invite ses créanciers aux enchères
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h12</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-5
                homeHeadlinesCard
                homeHeadlinesCard--size-small
                homeHeadlinesCard--section-ACT
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="e6e7eea4fc563b44a07b5c1f8fb9c9ec"
            data-target-legacy-id="5280521"
            data-position="5"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/e6e7eea4fc563b44a07b5c1f8fb9c9ec">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/les-deputes-jonglent-avec-differents-scenarios-de-vote-virtuel.php" class="homeHeadlinesCard__cover" title="Les députés jonglent avec différents scénarios de vote virtuel">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/db2c3838-bfd7-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/db2c3838-bfd7-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/db2c3838-bfd7-11ea-b33c-02fe89184577.jpg" alt=" Les députés jonglent avec différents scénarios de vote virtuel)">
                    </picture>
                                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/les-deputes-jonglent-avec-differents-scenarios-de-vote-virtuel.php" title="Les députés jonglent avec différents scénarios de vote virtuel"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/les-deputes-jonglent-avec-differents-scenarios-de-vote-virtuel.php" title="Les députés jonglent avec différents scénarios de vote virtuel">
                        Les députés jonglent avec différents scénarios de vote virtuel
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 18h28</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-6
                homeHeadlinesCard
                homeHeadlinesCard--size-small
                homeHeadlinesCard--section-SPO
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="446131cd0c6e38f9acd6cff86d4fd819"
            data-target-legacy-id="5280507"
            data-position="6"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/446131cd0c6e38f9acd6cff86d4fd819">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" class="homeHeadlinesCard__cover" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/41acdde6/ca24f88c-bfcb-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/41acdde6/ca24f88c-bfcb-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/41acdde6/ca24f88c-bfcb-11ea-b33c-02fe89184577.jpg" alt=" Patrick Mahomes signe le contrat le plus lucratif de l’histoire)">
                    </picture>
                                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                        Patrick Mahomes signe le contrat le plus lucratif de l’histoire
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h03</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-7
                homeHeadlinesCard
                homeHeadlinesCard--size-small
                homeHeadlinesCard--section-ACT
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="826cb0437f6d3b518a82f8b695d007be"
            data-target-legacy-id="5280484"
            data-position="7"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/826cb0437f6d3b518a82f8b695d007be">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" class="homeHeadlinesCard__cover" title="Débordements dans les bars: Dubé promet amendes et fermetures">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg" alt=" Débordements dans les bars: Dubé promet amendes et fermetures)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>02:07</span>
</span>

                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" title="Débordements dans les bars: Dubé promet amendes et fermetures"></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" title="Débordements dans les bars: Dubé promet amendes et fermetures">
                        Débordements dans les bars: Dubé promet amendes et fermetures
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 13h04</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 13h58</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-8
                homeHeadlinesCard
                homeHeadlinesCard--size-small
                homeHeadlinesCard--section-ACT
                homeHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="06ca2cacb931300dbf888702d70ed13f"
            data-target-legacy-id="5280493"
            data-position="8"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/06ca2cacb931300dbf888702d70ed13f">
        </div>
        <div class="homeHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/acquittement-du-leader-d-atalante-la-couronne-fait-appel-sur-deux-chefs.php" class="homeHeadlinesCard__cover" title="Acquittement du leader d’Atalante: la Couronne fait appel sur deux chefs ">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/1274e45a-bfb8-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/1274e45a-bfb8-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/1274e45a-bfb8-11ea-b33c-02fe89184577.jpg" alt=" Acquittement du leader d’Atalante: la Couronne fait appel sur deux chefs )">
                    </picture>
                                            </a>
                        <div class="homeHeadlinesCard__details">
                <div class="homeHeadlinesCard__tag"></div>
                <div class="homeHeadlinesCard__label homeHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/acquittement-du-leader-d-atalante-la-couronne-fait-appel-sur-deux-chefs.php" title="Acquittement du leader d’Atalante: la Couronne fait appel sur deux chefs "></a>
                </span>
                <h2 class="storyCard__title homeHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-06/acquittement-du-leader-d-atalante-la-couronne-fait-appel-sur-deux-chefs.php" title="Acquittement du leader d’Atalante: la Couronne fait appel sur deux chefs ">
                        Acquittement du leader d’Atalante: la Couronne fait appel sur deux chefs 
                    </a>
                </h2>
                                <p class="homeHeadlinesCard__publicationDates">
                    
    <span>Publié à 14h41</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    </div>
                    <div class="homeHeadlinesRow__aside">
                <div class="homeHeadlinesRow__stickyWrapper  homeHeadlinesRow__stickyWrapper--displayMode-noHeader">
                    <div class="homeHeadlinesRow--wrapper-pub">
                        <div class="adsWrapper greyLineToppedBox">
                            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2a6fa2-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2a6fa2-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2a6fa2-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos1"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2a6fa2-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2a6fa2-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = [[300,250],[300,600]]
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "right-col")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2a6fa2-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'right-col', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

                        </div>
                    </div>

                    <div class="editorsChoiceHeadlines pageBlock--emplacement-homePageEditorsChoicePos2 display-none" data-location="home-donotmiss">
                        <h2 class="header">
                            À ne pas manquer
                        </h2>
                        
<ul class="editorsChoiceHeadlines__verticalList">
    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-1
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-SPO
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="da4887836735338687b8b72a00cc1dbb"
            data-target-legacy-id="5280514"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/da4887836735338687b8b72a00cc1dbb">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" class="editorsChoiceCard__cover" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg" alt=" Price, Weber et Gallagher sur la patinoire à Brossard)"/>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:36</span>
</span>

                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                        Price, Weber et Gallagher sur la patinoire à Brossard
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 17h51</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 18h50</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-2
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-SOC
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="b50ffc73ed6338d4acea2c38a9eee0e2"
            data-target-legacy-id="5280389"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/b50ffc73ed6338d4acea2c38a9eee0e2">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" class="editorsChoiceCard__cover" title="Les camps de vacances, icônes culturelles">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg" alt=" Les camps de vacances, icônes culturelles)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles">
                        Les camps de vacances, icônes culturelles
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-3
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-MAI
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="4037cd7d08ab3c1180b802ab64eb8012"
            data-target-legacy-id="5280459"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/12/4037cd7d08ab3c1180b802ab64eb8012">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" class="editorsChoiceCard__cover" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg" alt=" Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-MAI"></div>
                <div class="sectionDash sectionDash--section-MAI"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                        Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-4
                editorsChoiceCard
                editorsChoiceCard--size-mini
                editorsChoiceCard--section-VOY
                editorsChoiceCard--displayMode-default
                editorsChoiceCard--position-aside            "
            data-target-type="story"
            data-target-id="165093471d36346e9f02d757cd4d701e"
            data-target-legacy-id="5280384"
            data-position="4"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/11/165093471d36346e9f02d757cd4d701e">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" class="editorsChoiceCard__cover" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg" alt=" Gérard Bodard et Richard Chartrand: les rois des Zingues)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-VOY"></div>
                <div class="sectionDash sectionDash--section-VOY"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                        Gérard Bodard et Richard Chartrand: les rois des Zingues
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

</ul>

                    </div>

                    
                </div>
            </div>
            </div>

    <div class="homeRow homeRow--layout-row pageBlock--emplacement-homePageSectionHeadlines1" data-lazy-module="homeSection" data-location="home-section">
        
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-3
                            homeSectionHeadlines--layout-row
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ACT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/covid-19/"
        >
            COVID-19
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-inline
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="0f1488640fa63a068258f25a2b757265"
            data-target-legacy-id="5280464"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/0f1488640fa63a068258f25a2b757265">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-trois-nouveaux-deces-au-quebec.php" class="homeSectionHeadlinesCard__cover" title="COVID-19: trois nouveaux décès au Québec">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/78855cf3-bf9c-11ea-b33c-02fe89184577.jpg" alt=" COVID-19: trois nouveaux décès au Québec)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-trois-nouveaux-deces-au-quebec.php" title="COVID-19: trois nouveaux décès au Québec"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-trois-nouveaux-deces-au-quebec.php" title="COVID-19: trois nouveaux décès au Québec">
                        COVID-19: trois nouveaux décès au Québec
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h13</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 11h24</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-inline
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="3b133964f66134aab038028190b71273"
            data-target-legacy-id="5280487"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/3b133964f66134aab038028190b71273">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/formation-des-preposes-aux-beneficiaires-en-stage-5-par-quart.php" class="homeSectionHeadlinesCard__cover" title="Formation des préposés aux bénéficiaires en stage: 5 $ par quart">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/a112edbd-bfb1-11ea-b33c-02fe89184577.jpg" alt=" Formation des préposés aux bénéficiaires en stage: 5 $ par quart)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/formation-des-preposes-aux-beneficiaires-en-stage-5-par-quart.php" title="Formation des préposés aux bénéficiaires en stage: 5 $ par quart"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/formation-des-preposes-aux-beneficiaires-en-stage-5-par-quart.php" title="Formation des préposés aux bénéficiaires en stage: 5 $ par quart">
                        Formation des préposés aux bénéficiaires en stage: 5 $ par quart
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 13h54</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-inline
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="e7d97b331dfa3ef9ad12cccf1baa10eb"
            data-target-legacy-id="5280461"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/e7d97b331dfa3ef9ad12cccf1baa10eb">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-l-aide-financiere-aux-aines-arrive-cette-semaine.php" class="homeSectionHeadlinesCard__cover" title="COVID-19: l’aide financière aux aînés arrive cette semaine">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/646cba5c-bf9a-11ea-b33c-02fe89184577.jpg" alt=" COVID-19: l’aide financière aux aînés arrive cette semaine)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-l-aide-financiere-aux-aines-arrive-cette-semaine.php" title="COVID-19: l’aide financière aux aînés arrive cette semaine"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/covid-19-l-aide-financiere-aux-aines-arrive-cette-semaine.php" title="COVID-19: l’aide financière aux aînés arrive cette semaine">
                        COVID-19: l’aide financière aux aînés arrive cette semaine
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h08</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

    </div>

    
    <div class="homeRow pageBlock--emplacement-homePageSectionHeadlines3 homeRow--layout-column" data-location="home-section" data-same-height=".homeSectionHeadlinesCard--size-large">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-3
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ACT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/actualites/"
        >
            Actualités
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-large
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="5eca37e1a88534179e24893d83932411"
            data-target-legacy-id="5280455"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/5eca37e1a88534179e24893d83932411">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" class="homeSectionHeadlinesCard__cover" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence">
                                    <img src="../mobile-img.lpcdn.ca/lpca/924x/r3996/5787f1b6-bf97-11ea-b33c-02fe89184577.jpg" alt=" Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence)"/>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:08</span>
</span>

                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence">
                        Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de...
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 10h47</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 17h46</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d248445fda31365e8c500fb4b6f58481"
            data-target-legacy-id="5280511"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/d248445fda31365e8c500fb4b6f58481">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/2020-07-06/lac-megantic-une-inspection-des-rails-exigee-par-des-citoyens.php" class="homeSectionHeadlinesCard__cover" title="Lac-Mégantic: une inspection des rails exigée par des citoyens">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3c6bce25-bfce-11ea-b33c-02fe89184577.jpg" alt=" Lac-Mégantic: une inspection des rails exigée par des citoyens)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/2020-07-06/lac-megantic-une-inspection-des-rails-exigee-par-des-citoyens.php" title="Lac-Mégantic: une inspection des rails exigée par des citoyens"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/2020-07-06/lac-megantic-une-inspection-des-rails-exigee-par-des-citoyens.php" title="Lac-Mégantic: une inspection des rails exigée par des citoyens">
                        Lac-Mégantic: une inspection des rails exigée par des citoyens
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h26</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="af67f44bf5263b26a418cf764e99fe85"
            data-target-legacy-id="5280512"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/af67f44bf5263b26a418cf764e99fe85">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/national/2020-07-06/clearview-abandonne-son-service-de-reconnaissance-faciale-au-canada.php" class="homeSectionHeadlinesCard__cover" title="Clearview abandonne son service de reconnaissance faciale au Canada">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8b8b144a-bfcf-11ea-b33c-02fe89184577.jpg" alt=" Clearview abandonne son service de reconnaissance faciale au Canada)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/national/2020-07-06/clearview-abandonne-son-service-de-reconnaissance-faciale-au-canada.php" title="Clearview abandonne son service de reconnaissance faciale au Canada"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/national/2020-07-06/clearview-abandonne-son-service-de-reconnaissance-faciale-au-canada.php" title="Clearview abandonne son service de reconnaissance faciale au Canada">
                        Clearview abandonne son service de reconnaissance faciale au Canada
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h28</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-3
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-INT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/international/"
        >
            International
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-large
                homeSectionHeadlinesCard--section-INT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="18daf92eba863ab19a3971bb4aa86070"
            data-target-legacy-id="5280518"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/18daf92eba863ab19a3971bb4aa86070">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/international/europe/2020-07-06/les-180-migrants-secourus-en-mer-par-l-ocean-viking-debarques-en-sicile.php" class="homeSectionHeadlinesCard__cover" title="Les 180 migrants secourus en mer par l’Ocean Viking débarqués en Sicile">
                                    <img src="../mobile-img.lpcdn.ca/lpca/924x/r3996/f9c9eeda-bfd5-11ea-b33c-02fe89184577.jpg" alt=" Les 180 migrants secourus en mer par l’Ocean Viking débarqués en Sicile)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/les-180-migrants-secourus-en-mer-par-l-ocean-viking-debarques-en-sicile.php" title="Les 180 migrants secourus en mer par l’Ocean Viking débarqués en Sicile"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/les-180-migrants-secourus-en-mer-par-l-ocean-viking-debarques-en-sicile.php" title="Les 180 migrants secourus en mer par l’Ocean Viking débarqués en Sicile">
                        Les 180 migrants secourus en mer par l’<em>Ocean Viking</em> débarqués en Sicile
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 18h21</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-INT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="eecb5d0cdae93ed6be3cb242f6320df1"
            data-target-legacy-id="5280506"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/eecb5d0cdae93ed6be3cb242f6320df1">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/e-u-fin-des-visas-pour-les-etudiants-etrangers-en-cas-de-cours-en-ligne.php" class="homeSectionHeadlinesCard__cover" title="É.-U.: fin des visas pour les étudiants étrangers en cas de cours en ligne">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/a0a58494-bfce-11ea-b33c-02fe89184577.jpg" alt=" É.-U.: fin des visas pour les étudiants étrangers en cas de cours en ligne)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/e-u-fin-des-visas-pour-les-etudiants-etrangers-en-cas-de-cours-en-ligne.php" title="É.-U.: fin des visas pour les étudiants étrangers en cas de cours en ligne"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/e-u-fin-des-visas-pour-les-etudiants-etrangers-en-cas-de-cours-en-ligne.php" title="É.-U.: fin des visas pour les étudiants étrangers en cas de cours en ligne">
                        É.-U.: fin des visas pour les étudiants étrangers en cas de cours en ligne
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 16h56</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-INT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="1eb10407b89231078ac9047ea4e996e3"
            data-target-legacy-id="5280498"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/1eb10407b89231078ac9047ea4e996e3">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/international/europe/2020-07-06/la-reprise-de-l-epidemie-en-catalogne-inquiete-les-autorites.php" class="homeSectionHeadlinesCard__cover" title="La reprise de l’épidémie en Catalogne inquiète les autorités">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/cfe63b5c-bfbe-11ea-b33c-02fe89184577.jpg" alt=" La reprise de l’épidémie en Catalogne inquiète les autorités)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/la-reprise-de-l-epidemie-en-catalogne-inquiete-les-autorites.php" title="La reprise de l’épidémie en Catalogne inquiète les autorités"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/la-reprise-de-l-epidemie-en-catalogne-inquiete-les-autorites.php" title="La reprise de l’épidémie en Catalogne inquiète les autorités">
                        La reprise de l’épidémie en Catalogne inquiète les autorités
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 15h31</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-3
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-AFF"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/affaires/"
        >
            Affaires
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-large
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="bf016716d55a38748e42b3ec3fe8fc72"
            data-target-legacy-id="5280510"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/bf016716d55a38748e42b3ec3fe8fc72">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" class="homeSectionHeadlinesCard__cover" title="Le Cirque du Soleil invite ses créanciers aux enchères">
                                    <img src="../mobile-img.lpcdn.ca/lpca/924x/r3996/4118bbc2-bfcd-11ea-b33c-02fe89184577.jpg" alt=" Le Cirque du Soleil invite ses créanciers aux enchères)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" title="Le Cirque du Soleil invite ses créanciers aux enchères"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/le-cirque-du-soleil-invite-ses-creanciers-aux-encheres.php" title="Le Cirque du Soleil invite ses créanciers aux enchères">
                        Le Cirque du Soleil invite ses créanciers aux enchères
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h12</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="0baed29727d93d5889da99d13846b868"
            data-target-legacy-id="5280502"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/0baed29727d93d5889da99d13846b868">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/lutte-contre-le-racisme-laval-boycotte-facebook.php" class="homeSectionHeadlinesCard__cover" title="Lutte contre le racisme: Laval boycotte Facebook">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8b2b5491-bfc4-11ea-b33c-02fe89184577.jpg" alt=" Lutte contre le racisme: Laval boycotte Facebook)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/lutte-contre-le-racisme-laval-boycotte-facebook.php" title="Lutte contre le racisme: Laval boycotte Facebook"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/lutte-contre-le-racisme-laval-boycotte-facebook.php" title="Lutte contre le racisme: Laval boycotte Facebook">
                        Lutte contre le racisme: Laval boycotte Facebook
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 16h10</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="6c95d593016231cf83243262051e7020"
            data-target-legacy-id="5280509"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/6c95d593016231cf83243262051e7020">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/la-banque-royale-accroit-ses-objectifs-en-matiere-de-diversite.php" class="homeSectionHeadlinesCard__cover" title="La Banque Royale accroît ses objectifs en matière de diversité">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/7853f5de-bfcb-11ea-b33c-02fe89184577.jpg" alt=" La Banque Royale accroît ses objectifs en matière de diversité)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/la-banque-royale-accroit-ses-objectifs-en-matiere-de-diversite.php" title="La Banque Royale accroît ses objectifs en matière de diversité"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/la-banque-royale-accroit-ses-objectifs-en-matiere-de-diversite.php" title="La Banque Royale accroît ses objectifs en matière de diversité">
                        La Banque Royale accroît ses objectifs en matière de diversité
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h07</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

    <div class="homeRow pageBox">
        
<style>
    .rl_input {
        border-top: none;
        border-left: none;
        border-right: none;
        border-bottom: solid 1px #d4d4d4;
        border-radius: 0;
        width: 100%;
        max-width: 250px;
        height: 40px;
        padding-left: 0;
        padding-right: 0;
        font-family: Rubrik, Arial;
        font-size: 16px;
        margin-bottom: 20px;
    }

    .rl_input:focus {
        outline-width: 0;
    }

    .nl_box {
        max-width: 742px;
        background-color: #fff;
        border: solid 8px #840132;
        margin: 0 auto;
        width: 300px;
        box-sizing: border-box;
    }

    .nl_box-clear {
        clear: both;
    }

    .nl_box-wrapper {
        margin: 20px;
    }

    .nl_box-wrapper-inner {
        height: 100%;
    }

    .nl_box-wrapper header, .nl_box-wrapper-form  {
        width: 100%
    }

    @media screen and (max-width: 338px) {
        aside.row .nl_box,
        .newsletterRegisterBox--medium .nl_box {
            margin: 10px 10px 20px;
            width: auto;
        }
    }

    @media screen and (max-width: 540px) {
        aside.row .nl_box,
        .newsletterRegisterBox--medium .nl_box {
            max-width: 100%;
        }
    }

    @media screen and (min-width: 540px) {

        aside.row .nl_box,
        .newsletterRegisterBox--medium .nl_box {
            margin: 10px auto 20px;
            width: auto;
        }

        aside.row .nl_box-wrapper header,
        aside.row .nl_box-wrapper-form,
        .newsletterRegisterBox--medium .nl_box-wrapper header,
        .newsletterRegisterBox--medium .nl_box-wrapper-form {
            float: left;
            width: 50%;
        }

        aside.row .nl_box-wrapper-form,
        .newsletterRegisterBox--medium .nl_box-wrapper-form {
            padding-left: 10%;
        }
    }

    @media screen and (min-width: 540px) and (max-width: 758px) {
        aside.row .nl_box,
        .newsletterRegisterBox--medium .nl_box {
            margin: 10px 10px 20px;
            width: auto;
        }
    }

    .nl_box-wrapper header p {
        font-family: Verlag;
        font-size: 16px;
        color: #393939;
        margin-top: 9px;
    }

    header p.nl_box-wrapper-tag {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 0;
        text-transform: uppercase;
    }

    .nl_box-wrapper header .nl_box-wrapper-title {
        font-size: 28px;
        color: #840132;
        margin-top: 0;
        margin-bottom: 0;
        font-weight: 900;
    }

    .nl_box-wrapper-subtitle {
        font-family: Arial;
        font-size: 14px;
        margin-top: 10px;
        line-height:1.52;
    }

    .nl_box-wrapper-form {
        min-height: 200px;
        font-family: Arial;
        font-size: 18px;
        line-height: 1.52;
        margin-top: 10px;
    }

    .nl_box-wrapper-form-error {
        height: 24px;
        font-family: Arial;
        font-size: 12px;
        color: #ff0000;
        display:none;
    }

    .nl_box-wrapper-form-submit {
        width: 100%;
        max-width: 255px;
        height: 60px;
        font-family: Rubrik;
        font-size: 20px;
        margin-top: 10px;
        color: #393939;
        background-color: #d4d4d4;
        margin-left: auto;
        margin-right: auto;
        border: 0;
        border-radius: 0;
        -webkit-appearance: none;
        -webkit-border-radius: 0;
        font-weight: 500;
        cursor: pointer;
    }

    .nl_box-confirm {
        width: 260px;
        min-height: 125px;
        padding: 18px;
        font-family: Arial;
        font-size: 14px;
        font-weight:bold;
        display: none;
        text-align:center;
    }

    /**/
    /* Large */
    /**/

    .newsletterRegisterBox--large .nl_box {
        width: 100%;
        max-width: none;
    }

    .newsletterRegisterBox--large header,
    .newsletterRegisterBox--large .nl_box-wrapper-form-text,
    .newsletterRegisterBox--large .nl_box-wrapper-form-btn-submit {
        padding: 25px;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-inner {
        display: flex;
        flex-direction: row;
    }

    .newsletterRegisterBox--large header {
        flex: 1;
    }

    .newsletterRegisterBox--large header p.nl_box-wrapper-tag {
        /* todo activate when site gets wider */
        /*font-size: 27px;*/
        font-size: 22px;
    }

    .newsletterRegisterBox--large .nl_box-wrapper header .nl_box-wrapper-title {
        /* todo activate when site gets wider */
        /*font-size: 42px;*/
        font-size: 34px;
        line-height: 43px;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form {
        flex: 2;
        display: flex;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form-text,
    .newsletterRegisterBox--large .nl_box-wrapper-form-btn-submit {
        flex: 1;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form-text {
        display: flex;
        justify-content: flex-end;
        flex-direction: column;
    }

    .newsletterRegisterBox--large input.rl_input {
        flex: 1;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form-text input {
        max-width: none;
        width: 100%;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form-btn-submit {
        align-self: flex-end;
        margin-bottom: 16px;
    }

    .newsletterRegisterBox--large .nl_box-wrapper-form-submit {
        display: block;
        width: 100%;
        max-width: 100%;
    }

    /** Small Screen Responsive */
    @media (max-width: 1023px) {
        .newsletterRegisterBox--responsive .nl_box {
            width: 300px;
        }

        .newsletterRegisterBox--responsive header,
        .newsletterRegisterBox--responsive .nl_box-wrapper-form-text,
        .newsletterRegisterBox--responsive .nl_box-wrapper-form-btn-submit {
            padding: 0;
        }

        .newsletterRegisterBox--responsive .nl_box-wrapper-inner {
            display: block;
        }

        .newsletterRegisterBox--responsive header p.nl_box-wrapper-tag {
            font-size: 18px;
        }

        .newsletterRegisterBox--responsive .nl_box-wrapper header .nl_box-wrapper-title {
            font-size: 28px;
        }

        .newsletterRegisterBox--responsive .nl_box-wrapper-form {
            display: block;
        }

        .newsletterRegisterBox--responsive .nl_box-wrapper-form-text {
            display: block;
        }
    }
</style>

<script>
    function reset_error(i) {
        var err_email = document.getElementById("error_email" + i);
        err_email.style.display = 'none';
        var err_prenom = document.getElementById("error_prenom" + i);
        err_prenom.style.display = 'none';
        var err_nom = document.getElementById("error_nom" + i);
        err_nom.style.display = 'none';
        var err_global = document.getElementById("error_global" + i);
        err_global.style.display = 'none';
    }

    function subscribe_rl(i) {
        reset_error(i);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://n4qgibpuu9.execute-api.us-east-1.amazonaws.com/prod/email-opt-in');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (xhr.status === 400) {
                switch (xhr.responseText) {
                    case "errCourriel":
                        var err_email = document.getElementById("error_email" + i);
                        err_email.style.display = 'block';
                        break;
                    case "errPrenom":
                        var err_prenom = document.getElementById("error_prenom" + i);
                        err_prenom.style.display = 'block';
                        break;
                    case "errNom":
                        var err_nom = document.getElementById("error_nom" + i);
                        err_nom.style.display = 'block';
                        break;
                    default:
                        var err_global = document.getElementById("error_global" + i);
                        err_global.style.display = 'block';
                        break;
                }
            } else if (xhr.status === 200) {
                var thankyou_div = document.getElementById("thankyou_rl" + i);
                thankyou_div.style.display = 'block';
                var form_div = document.getElementById("form_rl" + i);
                form_div.style.display = 'none';
            } else {
                alert("Il s'est produit une erreur. Réessayez plus tard.");
            }
        };
        xhr.send(encodeURI('courriel=' + document.getElementById("courriel" + i).value + '&prenom=' + document.getElementById("prenom" + i).value + '&nom=' + document.getElementById("nom" + i).value + '&type=' + document.getElementById("type_infolettre" + i).value));
    }
</script>

<div class="newsletterRegisterBox newsletterRegisterBox--large newsletterRegisterBox--responsive" data-object-id="NewsletterCOVID19Family">
    <div class="nl_box">
        <div class="nl_box-wrapper">
            <div class="nl_box-wrapper-inner">
                <header>
                    <p class="nl_box-wrapper-tag">Infolettre</p>
                    <p class="nl_box-wrapper-title">Un nouveau quotidien</p>
                    <p class="nl_box-wrapper-subtitle">Recevez chaque semaine des suggestions originales pour vous aider à vous adapter à votre réalité.</p>
                </header>
                <div class="nl_box-wrapper-form" id="form_rlad5f03adf2aa6ed">
                    <div class="nl_box-wrapper-form-text">
                        <input id="type_infolettread5f03adf2aa6ed" type="hidden" value="covid19famille"/>
                        <div class="nl_box-wrapper-form-error" id="error_globalad5f03adf2aa6ed">Veuillez remplir les champs SVP</div>
                        <input id="courrielad5f03adf2aa6ed" type="text" placeholder="Courriel" class="rl_input" />
                        <div class="nl_box-wrapper-form-error" id="error_emailad5f03adf2aa6ed">Le format du champ Courriel n&rsquo;est pas valide</div>
                        <input id="prenomad5f03adf2aa6ed" type="text" placeholder="Pr&eacute;nom" class="rl_input" />
                        <div class="nl_box-wrapper-form-error" id="error_prenomad5f03adf2aa6ed">Le format du champ Prenom n&rsquo;est pas valide</div>
                        <input id="nomad5f03adf2aa6ed" type="text" placeholder="Nom" class="rl_input" />
                        <div class="nl_box-wrapper-form-error" id="error_nomad5f03adf2aa6ed">Le format du champ Nom n&rsquo;est pas valide</div>
                    </div>
                    <div class="nl_box-wrapper-form-btn-submit">
                        <input type="button" class="nl_box-wrapper-form-submit" onclick="subscribe_rl('ad5f03adf2aa6ed');" value="Je m’inscris">
                    </div>
                </div>
                <div class="nl_box-confirm" id="thankyou_rlad5f03adf2aa6ed">Inscription réussie. Merci.</div>
                <div class="nl_box-clear"></div>
            </div>
        </div>
    </div>
</div>


    </div>

    <div class="homeRow homeTrending pageBlock--emplacement-homePageTrendings" data-lazy-module="trending" data-location="home-trending">
        <h2 class="subHeader subHeader--type-trending">Les plus consultés</h2>
        <dl class="homeTrending__tabList">
            <dt class="homeTrending__tab">Dernière heure</dt>
            <dd class="homeTrending__tabContent">
                    <ul class="homeTrending__articleList" data-timeframe="now">
                    <li data-position="1">
                <article class="
                        storyCard
                        storyCard--position-1
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="d49a500fed623128a4bccaac99a7f3c9"
                    data-target-legacy-id="5280503"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/258/d49a500fed623128a4bccaac99a7f3c9/5280503">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/covid-19/2020-07-06/montreal-va-rendre-le-masque-obligatoire-dans-les-lieux-publics-fermes.php" class="homeTrendingCard__cover" title="Montréal va rendre le masque obligatoire dans les lieux publics fermés">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/c5dbc9ae/b7bdb0e1-bfcc-11ea-b33c-02fe89184577.jpg" alt=" Montréal va rendre le masque obligatoire dans les lieux publics fermés)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:07</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/covid-19/2020-07-06/montreal-va-rendre-le-masque-obligatoire-dans-les-lieux-publics-fermes.php" title="Montréal va rendre le masque obligatoire dans les lieux publics fermés">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Montréal va rendre le masque obligatoire dans les lieux publics fermés</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 16h10</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 17h10</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="2">
                <article class="
                        storyCard
                        storyCard--position-2
                        homeTrendingCard
                        homeTrendingCard--section-SPO
                    "
                    data-target-type="story"
                    data-target-id="446131cd0c6e38f9acd6cff86d4fd819"
                    data-target-legacy-id="5280507"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/5/446131cd0c6e38f9acd6cff86d4fd819/5280507">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" class="homeTrendingCard__cover" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/41acdde6/ca24f88c-bfcb-11ea-b33c-02fe89184577.jpg" alt=" Patrick Mahomes signe le contrat le plus lucratif de l’histoire)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-SPO"></div>
                                <div class="sectionDash sectionDash--section-SPO"></div>
                            </div>
                            <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Patrick Mahomes signe le contrat le plus lucratif de l’histoire</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 17h03</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="3">
                <article class="
                        storyCard
                        storyCard--position-3
                        homeTrendingCard
                        homeTrendingCard--section-ART
                    "
                    data-target-type="story"
                    data-target-id="73c4e539c2a631269d28e66d82e853d5"
                    data-target-legacy-id="5280479"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/7/73c4e539c2a631269d28e66d82e853d5/5280479">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" class="homeTrendingCard__cover" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg" alt=" Mort d’Aubert Pallascio, un acteur très doué et très discret)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>00:51</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ART"></div>
                                <div class="sectionDash sectionDash--section-ART"></div>
                            </div>
                            <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Mort d’Aubert Pallascio, un acteur très doué et très discret</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 13h02</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 14h34</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="4">
                <article class="
                        storyCard
                        storyCard--position-4
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="6febfbe904e135d19a917c518aae87a7"
                    data-target-legacy-id="5280349"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/6febfbe904e135d19a917c518aae87a7/5280349">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" class="homeTrendingCard__cover" title="Du poisson fumé à travers les moisissures">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/2ae08f69-be6d-11ea-b33c-02fe89184577.jpg" alt=" Du poisson fumé à travers les moisissures)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" title="Du poisson fumé à travers les moisissures">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Du poisson fumé à travers les moisissures</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié hier à 5h00</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="5">
                <article class="
                        storyCard
                        storyCard--position-5
                        homeTrendingCard
                        homeTrendingCard--section-INT
                    "
                    data-target-type="story"
                    data-target-id="f70beafbdf263deb91095be836e07c06"
                    data-target-legacy-id="5280486"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/2/f70beafbdf263deb91095be836e07c06/5280486">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/la-sortie-du-livre-de-la-niece-de-trump-devancee-au-14-juillet.php" class="homeTrendingCard__cover" title="La sortie du livre de la nièce de Trump devancée au 14 juillet">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0f578b76/fb652bac-bfaf-11ea-b33c-02fe89184577.jpg" alt=" La sortie du livre de la nièce de Trump devancée au 14 juillet)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-INT"></div>
                                <div class="sectionDash sectionDash--section-INT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/la-sortie-du-livre-de-la-niece-de-trump-devancee-au-14-juillet.php" title="La sortie du livre de la nièce de Trump devancée au 14 juillet">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">La sortie du livre de la nièce de Trump devancée au 14 juillet</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 13h46</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="6">
                <article class="
                        storyCard
                        storyCard--position-6
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="c2e246b755633928a8762e2eadd74bd9"
                    data-target-legacy-id="5280425"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/c2e246b755633928a8762e2eadd74bd9/5280425">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/national/2020-07-06/la-chine-appelle-ses-citoyens-au-canada-a-la-prudence.php" class="homeTrendingCard__cover" title="La Chine appelle ses citoyens au Canada à la «prudence»">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/887dd429-bf79-11ea-b33c-02fe89184577.jpg" alt=" La Chine appelle ses citoyens au Canada à la «prudence»)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:14</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/national/2020-07-06/la-chine-appelle-ses-citoyens-au-canada-a-la-prudence.php" title="La Chine appelle ses citoyens au Canada à la «prudence»">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">La Chine appelle ses citoyens au Canada à la «prudence»</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 7h13</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 10h26</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
            </ul>

            </dd>
            <dt class="homeTrending__tab homeTrending__tab--active">Aujourd'hui</dt>
            <dd class="homeTrending__tabContent">
                    <ul class="homeTrending__articleList" data-timeframe="today">
                    <li data-position="1">
                <article class="
                        storyCard
                        storyCard--position-1
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="3585416b86b13007a326921cb28e746b"
                    data-target-legacy-id="5280385"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/258/3585416b86b13007a326921cb28e746b/5280385">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/covid-19/2020-07-05/des-clients-d-un-bar-du-dix30-contamines-par-le-coronavirus.php" class="homeTrendingCard__cover" title="Des clients d’un bar du Dix30 contaminés par le coronavirus">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/aeba4649-befc-11ea-b33c-02fe89184577.jpg" alt=" Des clients d’un bar du Dix30 contaminés par le coronavirus)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:53</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/covid-19/2020-07-05/des-clients-d-un-bar-du-dix30-contamines-par-le-coronavirus.php" title="Des clients d’un bar du Dix30 contaminés par le coronavirus">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Des clients d’un bar du Dix30 contaminés par le coronavirus</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour hier à 17h56</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="2">
                <article class="
                        storyCard
                        storyCard--position-2
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="6febfbe904e135d19a917c518aae87a7"
                    data-target-legacy-id="5280349"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/6febfbe904e135d19a917c518aae87a7/5280349">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" class="homeTrendingCard__cover" title="Du poisson fumé à travers les moisissures">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/2ae08f69-be6d-11ea-b33c-02fe89184577.jpg" alt=" Du poisson fumé à travers les moisissures)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" title="Du poisson fumé à travers les moisissures">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Du poisson fumé à travers les moisissures</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié hier à 5h00</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="3">
                <article class="
                        storyCard
                        storyCard--position-3
                        homeTrendingCard
                        homeTrendingCard--section-SPO
                    "
                    data-target-type="story"
                    data-target-id="9c746a7e16a93199847b44fa92900ff1"
                    data-target-legacy-id="5280447"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/5/9c746a7e16a93199847b44fa92900ff1/5280447">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/sports/course-automobile/2020-07-06/noeud-coulant-trump-veut-des-excuses-du-pilote-bubba-wallace.php" class="homeTrendingCard__cover" title="Noeud coulant: Trump veut des excuses du pilote Bubba Wallace">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/455f5542-bf90-11ea-b33c-02fe89184577.jpg" alt=" Noeud coulant: Trump veut des excuses du pilote Bubba Wallace)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:33</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-SPO"></div>
                                <div class="sectionDash sectionDash--section-SPO"></div>
                            </div>
                            <a href="https://www.lapresse.ca/sports/course-automobile/2020-07-06/noeud-coulant-trump-veut-des-excuses-du-pilote-bubba-wallace.php" title="Noeud coulant: Trump veut des excuses du pilote Bubba Wallace">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Noeud coulant: Trump veut des excuses du pilote Bubba Wallace</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 9h59</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 15h45</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="4">
                <article class="
                        storyCard
                        storyCard--position-4
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="e8e708f9ee103f2fadf192a7e69570cd"
                    data-target-legacy-id="5280416"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/258/e8e708f9ee103f2fadf192a7e69570cd/5280416">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/covid-19/2020-07-06/deconfinement-et-distanciation-c-est-bar-ouvert.php" class="homeTrendingCard__cover" title="Déconfinement et distanciation: c’est bar ouvert">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/15335fc1-bf38-11ea-b33c-02fe89184577.jpg" alt=" Déconfinement et distanciation: c’est bar ouvert)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/covid-19/2020-07-06/deconfinement-et-distanciation-c-est-bar-ouvert.php" title="Déconfinement et distanciation: c’est bar ouvert">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Déconfinement et distanciation: c’est bar ouvert</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 5h00</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="5">
                <article class="
                        storyCard
                        storyCard--position-5
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="c2e246b755633928a8762e2eadd74bd9"
                    data-target-legacy-id="5280425"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/c2e246b755633928a8762e2eadd74bd9/5280425">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/national/2020-07-06/la-chine-appelle-ses-citoyens-au-canada-a-la-prudence.php" class="homeTrendingCard__cover" title="La Chine appelle ses citoyens au Canada à la «prudence»">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/887dd429-bf79-11ea-b33c-02fe89184577.jpg" alt=" La Chine appelle ses citoyens au Canada à la «prudence»)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:14</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/national/2020-07-06/la-chine-appelle-ses-citoyens-au-canada-a-la-prudence.php" title="La Chine appelle ses citoyens au Canada à la «prudence»">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">La Chine appelle ses citoyens au Canada à la «prudence»</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 7h13</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 10h26</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="6">
                <article class="
                        storyCard
                        storyCard--position-6
                        homeTrendingCard
                        homeTrendingCard--section-INT
                    "
                    data-target-type="story"
                    data-target-id="c579835c38d53a0a90dab5e3fc1e5bac"
                    data-target-legacy-id="5280397"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/2/c579835c38d53a0a90dab5e3fc1e5bac/5280397">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/affaire-epstein-les-secrets-de-ghislaine-maxwell.php" class="homeTrendingCard__cover" title="Affaire Epstein: les secrets de Ghislaine Maxwell">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/499745e9-bf17-11ea-b33c-02fe89184577.jpg" alt=" Affaire Epstein: les secrets de Ghislaine Maxwell)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-INT"></div>
                                <div class="sectionDash sectionDash--section-INT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/affaire-epstein-les-secrets-de-ghislaine-maxwell.php" title="Affaire Epstein: les secrets de Ghislaine Maxwell">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Affaire Epstein: les secrets de Ghislaine Maxwell</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié à 5h00</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
            </ul>

            </dd>
            <dt class="homeTrending__tab">Cette semaine</dt>
            <dd class="homeTrending__tabContent">
                    <ul class="homeTrending__articleList" data-timeframe="weekly">
                    <li data-position="1">
                <article class="
                        storyCard
                        storyCard--position-1
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="6febfbe904e135d19a917c518aae87a7"
                    data-target-legacy-id="5280349"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/6febfbe904e135d19a917c518aae87a7/5280349">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" class="homeTrendingCard__cover" title="Du poisson fumé à travers les moisissures">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/2ae08f69-be6d-11ea-b33c-02fe89184577.jpg" alt=" Du poisson fumé à travers les moisissures)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-05/du-poisson-fume-a-travers-les-moisissures.php" title="Du poisson fumé à travers les moisissures">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Du poisson fumé à travers les moisissures</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié hier à 5h00</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="2">
                <article class="
                        storyCard
                        storyCard--position-2
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="3585416b86b13007a326921cb28e746b"
                    data-target-legacy-id="5280385"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/258/3585416b86b13007a326921cb28e746b/5280385">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/covid-19/2020-07-05/des-clients-d-un-bar-du-dix30-contamines-par-le-coronavirus.php" class="homeTrendingCard__cover" title="Des clients d’un bar du Dix30 contaminés par le coronavirus">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/aeba4649-befc-11ea-b33c-02fe89184577.jpg" alt=" Des clients d’un bar du Dix30 contaminés par le coronavirus)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:53</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/covid-19/2020-07-05/des-clients-d-un-bar-du-dix30-contamines-par-le-coronavirus.php" title="Des clients d’un bar du Dix30 contaminés par le coronavirus">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Des clients d’un bar du Dix30 contaminés par le coronavirus</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour hier à 17h56</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="3">
                <article class="
                        storyCard
                        storyCard--position-3
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="8ca4bff3ba633dc590da6eb68ae33726"
                    data-target-legacy-id="5280195"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/258/8ca4bff3ba633dc590da6eb68ae33726/5280195">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/covid-19/2020-07-03/covid-19-les-cas-en-croissance-chez-les-jeunes.php" class="homeTrendingCard__cover" title="COVID-19: les cas en croissance chez les jeunes">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3ec5333a-bd55-11ea-b33c-02fe89184577.jpg" alt=" COVID-19: les cas en croissance chez les jeunes)"/>
                                                            <span class="videoSticker">
    <span class='videoSticker__duration'>01:03</span>
</span>

                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/covid-19/2020-07-03/covid-19-les-cas-en-croissance-chez-les-jeunes.php" title="COVID-19: les cas en croissance chez les jeunes">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">COVID-19: les cas en croissance chez les jeunes</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour le 3 juillet</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="4">
                <article class="
                        storyCard
                        storyCard--position-4
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="3a4c6fb7ac1f3513be0f4568933a209f"
                    data-target-legacy-id="5280065"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/3a4c6fb7ac1f3513be0f4568933a209f/5280065">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/regional/2020-07-02/drame-en-monteregie-le-conducteur-du-tracteur-accuse-de-negligence-criminelle.php" class="homeTrendingCard__cover" title="Drame en Montérégie : le conducteur du tracteur accusé de négligence criminelle">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/f2f3a148-bc95-11ea-b33c-02fe89184577.jpg" alt=" Drame en Montérégie : le conducteur du tracteur accusé de négligence criminelle)"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/regional/2020-07-02/drame-en-monteregie-le-conducteur-du-tracteur-accuse-de-negligence-criminelle.php" title="Drame en Montérégie : le conducteur du tracteur accusé de négligence criminelle">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Drame en Montérégie : le conducteur du tracteur accusé de négligence criminelle</span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour le 2 juillet</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="5">
                <article class="
                        storyCard
                        storyCard--position-5
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="29d3113e5265300f9059db9bf6126c51"
                    data-target-legacy-id="5280114"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/29d3113e5265300f9059db9bf6126c51/5280114">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-02/avis-d-ebullition-d-eau-a-montreal.php" class="homeTrendingCard__cover" title="Avis d’ébullition d’eau à Montréal ">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8d1e0efa-bcd0-11ea-b33c-02fe89184577.jpg" alt=" Avis d’ébullition d’eau à Montréal )"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/grand-montreal/2020-07-02/avis-d-ebullition-d-eau-a-montreal.php" title="Avis d’ébullition d’eau à Montréal ">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Avis d’ébullition d’eau à Montréal </span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span>Publié le 2 juillet</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
                    <li data-position="6">
                <article class="
                        storyCard
                        storyCard--position-6
                        homeTrendingCard
                        homeTrendingCard--section-ACT
                    "
                    data-target-type="story"
                    data-target-id="a15879a0794a36b8a14a305a327406cd"
                    data-target-legacy-id="5280302"
                >
                    <div class="webpart adminContainer"
                        data-webpart-type="crayon"
                        data-webpart-validate-crayon="true"
                        data-webpart-url="/ops/webpart/crayon/article/1/a15879a0794a36b8a14a305a327406cd/5280302">
                    </div>
                    <div class="homeTrendingCard__inner">
                        <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-04/une-fillette-se-noie-dans-une-piscine-residentielle.php" class="homeTrendingCard__cover" title="Une fillette se noie dans une piscine résidentielle ">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/fa8f34c1-be25-11ea-b33c-02fe89184577.jpg" alt=" Une fillette se noie dans une piscine résidentielle )"/>
                                                    </a>
                        <div class="homeTrendingCard__details">
                            <div class="homeTrendingCard__tagLabelWrapper">
                                <div class="homeTrendingCard__tag"></div>
                                <div class="homeTrendingCard__label homeTrendingCard__label--section-ACT"></div>
                                <div class="sectionDash sectionDash--section-ACT"></div>
                            </div>
                            <a href="https://www.lapresse.ca/actualites/justice-et-faits-divers/2020-07-04/une-fillette-se-noie-dans-une-piscine-residentielle.php" title="Une fillette se noie dans une piscine résidentielle ">
                                <span class="homeTrendingCard__suptitle "></span>
                                <span class="homeTrendingCard__title ">Une fillette se noie dans une piscine résidentielle </span>
                            </a>
                            <p class="homeTrendingCard__publicationDates">
                                
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour le 4 juillet</span>

                            </p>
                        </div>
                    </div>
                </article>
            </li>
            </ul>

            </dd>
        </dl>
        <div class="clear"></div>
    </div>

    
    <div class="homeRow homeRow--wrapper-pub">
        <div class="adsWrapper greyLineToppedBox">
            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2ad239-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2ad239-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2ad239-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos2"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2ad239-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2ad239-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[[300,250],[300,600]],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2ad239-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

        </div>
            </div>

    <div class="homeRow pageBlock--emplacement-homePageSectionHeadlines4 homeRow--layout-column" data-location="home-section" data-same-height=".homeSectionHeadlinesCard--size-medium">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-4
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-SPO"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/sports/"
        >
            Sports
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-SPO
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="7848f4d00f4a3c46a36c04f4a70f13fd"
            data-target-legacy-id="5280517"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/7848f4d00f4a3c46a36c04f4a70f13fd">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" class="homeSectionHeadlinesCard__cover" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/0d121656-bfd6-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/0d121656-bfd6-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0d121656-bfd6-11ea-b33c-02fe89184577.jpg" alt=" Entente entre la LNH et les joueurs: des matchs dès le 1er août)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/entente-entre-la-lnh-et-les-joueurs-des-matchs-des-le-1er-aout.php" title="Entente entre la LNH et les joueurs: des matchs dès le 1er août">
                        Entente entre la LNH et les joueurs: des matchs dès le 1<sup>er </sup>août
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 18h16</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-SPO
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="6fd760043a723cf38086fd527124a66d"
            data-target-legacy-id="5280520"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/6fd760043a723cf38086fd527124a66d">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/le-fc-dallas-est-exclu-du-tournoi-de-la-mls.php" class="homeSectionHeadlinesCard__cover" title="Le FC Dallas est exclu du tournoi de la MLS">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/731850eb-bfd7-11ea-b33c-02fe89184577.jpg" alt=" Le FC Dallas est exclu du tournoi de la MLS)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/le-fc-dallas-est-exclu-du-tournoi-de-la-mls.php" title="Le FC Dallas est exclu du tournoi de la MLS"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/le-fc-dallas-est-exclu-du-tournoi-de-la-mls.php" title="Le FC Dallas est exclu du tournoi de la MLS">
                        Le FC Dallas est exclu du tournoi de la MLS
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 18h25</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 19h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-SPO
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="446131cd0c6e38f9acd6cff86d4fd819"
            data-target-legacy-id="5280507"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/446131cd0c6e38f9acd6cff86d4fd819">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" class="homeSectionHeadlinesCard__cover" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/41acdde6/ca24f88c-bfcb-11ea-b33c-02fe89184577.jpg" alt=" Patrick Mahomes signe le contrat le plus lucratif de l’histoire)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/sports/football/2020-07-06/patrick-mahomes-signe-le-contrat-le-plus-lucratif-de-l-histoire.php" title="Patrick Mahomes signe le contrat le plus lucratif de l’histoire">
                        Patrick Mahomes signe le contrat le plus lucratif de l’histoire
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 17h03</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-4
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-DEB"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/debats/"
        >
            Débats
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-DEB
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="5c8afc563f46335b9334e95f7587beea"
            data-target-legacy-id="5280408"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/3/5c8afc563f46335b9334e95f7587beea">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/debats/courrier-des-lecteurs/2020-07-06/courrier-des-lecteurs-partirez-vous-en-vacances.php" class="homeSectionHeadlinesCard__cover" title="Courrier des lecteurs: partirez-vous en vacances ? ">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/f52a0b64-bd4e-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/f52a0b64-bd4e-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/f52a0b64-bd4e-11ea-b33c-02fe89184577.jpg" alt=" Courrier des lecteurs: partirez-vous en vacances ? )">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-DEB">Débats</div>
                <div class="sectionDash sectionDash--section-DEB"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/debats/courrier-des-lecteurs/2020-07-06/courrier-des-lecteurs-partirez-vous-en-vacances.php" title="Courrier des lecteurs: partirez-vous en vacances ? "></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/debats/courrier-des-lecteurs/2020-07-06/courrier-des-lecteurs-partirez-vous-en-vacances.php" title="Courrier des lecteurs: partirez-vous en vacances ? ">
                        Courrier des lecteurs: partirez-vous en vacances ? 
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-DEB
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="7fb78de7072a3af4ba66b460d1d9fabf"
            data-target-legacy-id="5280407"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/3/7fb78de7072a3af4ba66b460d1d9fabf">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/il-faut-reduire-le-risque-de-futures-pandemies.php" class="homeSectionHeadlinesCard__cover" title="Il faut réduire le risque de futures pandémies">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/566d0bb1-bd60-11ea-b33c-02fe89184577.jpg" alt=" Il faut réduire le risque de futures pandémies)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-DEB">Débats</div>
                <div class="sectionDash sectionDash--section-DEB"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/il-faut-reduire-le-risque-de-futures-pandemies.php" title="Il faut réduire le risque de futures pandémies"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/il-faut-reduire-le-risque-de-futures-pandemies.php" title="Il faut réduire le risque de futures pandémies">
                        Il faut réduire le risque de futures pandémies
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-DEB
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="f90c2cc57d0a35ccbc0a733e67a7f988"
            data-target-legacy-id="5280406"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/3/f90c2cc57d0a35ccbc0a733e67a7f988">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/enseignement-a-distance-quel-heritage-des-carres-rouges.php" class="homeSectionHeadlinesCard__cover" title="Enseignement à distance: quel héritage des carrés rouges ? ">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/e1c648cb-bd49-11ea-b33c-02fe89184577.jpg" alt=" Enseignement à distance: quel héritage des carrés rouges ? )"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-DEB">Débats</div>
                <div class="sectionDash sectionDash--section-DEB"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/enseignement-a-distance-quel-heritage-des-carres-rouges.php" title="Enseignement à distance: quel héritage des carrés rouges ? "></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/debats/opinions/2020-07-06/enseignement-a-distance-quel-heritage-des-carres-rouges.php" title="Enseignement à distance: quel héritage des carrés rouges ? ">
                        Enseignement à distance: quel héritage des carrés rouges ? 
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 10h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-1
                            homeRow__column
                homeRow__column--col-4
                        "
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ART"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/arts/"
        >
            Arts
        </a>
    </h2>
    <ul>
                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-ART
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="73c4e539c2a631269d28e66d82e853d5"
            data-target-legacy-id="5280479"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/73c4e539c2a631269d28e66d82e853d5">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" class="homeSectionHeadlinesCard__cover" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg" alt=" Mort d’Aubert Pallascio, un acteur très doué et très discret)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:51</span>
</span>

                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" title="Mort d’Aubert Pallascio, un acteur très doué et très discret"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                        Mort d’Aubert Pallascio, un acteur très doué et très discret
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 13h02</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 14h34</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-ART
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="dcdb1556232b3149a8da6bee314d09c1"
            data-target-legacy-id="5280490"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/dcdb1556232b3149a8da6bee314d09c1">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/arts/television/2020-07-06/colin-kaepernick-s-associe-avec-disney-pour-des-emissions-sur-les-discriminations-raciales.php" class="homeSectionHeadlinesCard__cover" title="Colin Kaepernick s’associe avec Disney pour des émissions sur les discriminations raciales">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3effeeaa/3ae70c81-bfb5-11ea-b33c-02fe89184577.jpg" alt=" Colin Kaepernick s’associe avec Disney pour des émissions sur les discriminations raciales)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/colin-kaepernick-s-associe-avec-disney-pour-des-emissions-sur-les-discriminations-raciales.php" title="Colin Kaepernick s’associe avec Disney pour des émissions sur les discriminations raciales"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/colin-kaepernick-s-associe-avec-disney-pour-des-emissions-sur-les-discriminations-raciales.php" title="Colin Kaepernick s’associe avec Disney pour des émissions sur les discriminations raciales">
                        Colin Kaepernick s’associe avec Disney pour des émissions sur les...
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 14h21</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

        
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-3
                homeSectionHeadlinesCard
                homeSectionHeadlinesCard--size-mini
                homeSectionHeadlinesCard--section-ART
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="74bf6801267f3760819adfe086f0ad84"
            data-target-legacy-id="5280476"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/74bf6801267f3760819adfe086f0ad84">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/arts/television/2020-07-06/l-adisq-confirme-la-tenue-de-ses-deux-galas.php" class="homeSectionHeadlinesCard__cover" title="L’ADISQ confirme la tenue de ses deux galas">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/5c461da6-bfa6-11ea-b33c-02fe89184577.jpg" alt=" L’ADISQ confirme la tenue de ses deux galas)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/l-adisq-confirme-la-tenue-de-ses-deux-galas.php" title="L’ADISQ confirme la tenue de ses deux galas"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/l-adisq-confirme-la-tenue-de-ses-deux-galas.php" title="L’ADISQ confirme la tenue de ses deux galas">
                        L’ADISQ confirme la tenue de ses deux galas
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 12h37</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                <div class="homeRow__column homeRow__column--col-4 homeRow--wrapper-pub">
            <div class="homeRow__stickyWrapper adsWrapper greyLineToppedBox">
                <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2ade62-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2ade62-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2ade62-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos2"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2ade62-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2ade62-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = [[300,250],[300,600]]
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "right-col")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2ade62-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'right-col', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

                            </div>
        </div>
    </div>

    <div class="homeRow pageBlock--emplacement-homePageDoNotMiss editorsChoice" data-location="home-donotmiss">
        <h2 class="subHeader subHeader--type-editorsChoice">À ne pas manquer</h2>

        
<ul class="editorsChoice__horizontalList">
    

        
<li class="editorsChoice__item editorsChoice__item--firstFourth">
    <article class="
                storyCard
                storyCard--position-1
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-SPO
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="da4887836735338687b8b72a00cc1dbb"
            data-target-legacy-id="5280514"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/da4887836735338687b8b72a00cc1dbb">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" class="editorsChoiceCard__cover" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg" alt=" Price, Weber et Gallagher sur la patinoire à Brossard)"/>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:36</span>
</span>

                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                        Price, Weber et Gallagher sur la patinoire à Brossard
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 17h51</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 18h50</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item editorsChoice__item--firstFourth">
    <article class="
                storyCard
                storyCard--position-2
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-SOC
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="b50ffc73ed6338d4acea2c38a9eee0e2"
            data-target-legacy-id="5280389"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/b50ffc73ed6338d4acea2c38a9eee0e2">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" class="editorsChoiceCard__cover" title="Les camps de vacances, icônes culturelles">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg" alt=" Les camps de vacances, icônes culturelles)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles">
                        Les camps de vacances, icônes culturelles
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item editorsChoice__item--firstFourth">
    <article class="
                storyCard
                storyCard--position-3
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-MAI
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="4037cd7d08ab3c1180b802ab64eb8012"
            data-target-legacy-id="5280459"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/12/4037cd7d08ab3c1180b802ab64eb8012">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" class="editorsChoiceCard__cover" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg" alt=" Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-MAI"></div>
                <div class="sectionDash sectionDash--section-MAI"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                        Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item editorsChoice__item--firstFourth">
    <article class="
                storyCard
                storyCard--position-4
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-VOY
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="165093471d36346e9f02d757cd4d701e"
            data-target-legacy-id="5280384"
            data-position="4"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/11/165093471d36346e9f02d757cd4d701e">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" class="editorsChoiceCard__cover" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg" alt=" Gérard Bodard et Richard Chartrand: les rois des Zingues)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-VOY"></div>
                <div class="sectionDash sectionDash--section-VOY"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                        Gérard Bodard et Richard Chartrand: les rois des Zingues
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-5
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-AUT
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="89e279bc42eb308c94957c65a366f46d"
            data-target-legacy-id="5280445"
            data-position="5"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/6/89e279bc42eb308c94957c65a366f46d">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" class="editorsChoiceCard__cover" title="F-150 2021: Ford présente la 14e génération de son best-seller">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/ce891fdc-bc8a-11ea-b33c-02fe89184577.jpg" alt=" F-150 2021: Ford présente la 14e génération de son best-seller)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-AUT"></div>
                <div class="sectionDash sectionDash--section-AUT"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" title="F-150 2021: Ford présente la 14e génération de son best-seller"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" title="F-150 2021: Ford présente la 14e génération de son best-seller">
                        F-150 2021: Ford présente la 14<sup>e</sup> génération de son <em>best-seller</em>
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 11h45</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-6
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-ACT
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="e8e708f9ee103f2fadf192a7e69570cd"
            data-target-legacy-id="5280416"
            data-position="6"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/e8e708f9ee103f2fadf192a7e69570cd">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/deconfinement-et-distanciation-c-est-bar-ouvert.php" class="editorsChoiceCard__cover" title="Déconfinement et distanciation: c’est bar ouvert">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/15335fc1-bf38-11ea-b33c-02fe89184577.jpg" alt=" Déconfinement et distanciation: c’est bar ouvert)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/deconfinement-et-distanciation-c-est-bar-ouvert.php" title="Déconfinement et distanciation: c’est bar ouvert"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/deconfinement-et-distanciation-c-est-bar-ouvert.php" title="Déconfinement et distanciation: c’est bar ouvert">
                        Déconfinement et distanciation: c’est bar ouvert
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 5h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-7
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-AFF
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="4a0ce653e7af3ac196385a10dc864589"
            data-target-legacy-id="5280402"
            data-position="7"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/4a0ce653e7af3ac196385a10dc864589">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/affaires/2020-07-06/la-route-de-la-relance-le-manufacturier-est-bien-reparti-en-beauce.php" class="editorsChoiceCard__cover" title="La route de la relance: le manufacturier est bien reparti en Beauce">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/34c55be0/290e9a64-8e44-11ea-b33c-02fe89184577.png" alt=" La route de la relance: le manufacturier est bien reparti en Beauce)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-AFF">Jean-Philippe Décarie Chronique</div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="editorsChoiceCard__suptitle hasFeaturedAuthor">
                    <a href="https://www.lapresse.ca/affaires/2020-07-06/la-route-de-la-relance-le-manufacturier-est-bien-reparti-en-beauce.php" title="La route de la relance: le manufacturier est bien reparti en Beauce"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title hasFeaturedAuthor">
                    <a href="https://www.lapresse.ca/affaires/2020-07-06/la-route-de-la-relance-le-manufacturier-est-bien-reparti-en-beauce.php" title="La route de la relance: le manufacturier est bien reparti en Beauce">
                        La route de la relance: le manufacturier est bien reparti en Beauce
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 6h30</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-8
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-SOC
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="3d4849dc67c13cbca4add3e529182a58"
            data-target-legacy-id="5280388"
            data-position="8"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/3d4849dc67c13cbca4add3e529182a58">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/societe/2020-07-06/souvenirs-de-camp-de-vacances-de-beaux-cliches.php" class="editorsChoiceCard__cover" title="Souvenirs de camp de vacances: de beaux clichés">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/f6089e31-b1a0-11ea-b33c-02fe89184577.jpg" alt=" Souvenirs de camp de vacances: de beaux clichés)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/souvenirs-de-camp-de-vacances-de-beaux-cliches.php" title="Souvenirs de camp de vacances: de beaux clichés"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/souvenirs-de-camp-de-vacances-de-beaux-cliches.php" title="Souvenirs de camp de vacances: de beaux clichés">
                        Souvenirs de camp de vacances: de beaux clichés
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 9h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-9
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-DEB
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="b9315edd0f2e3fbd9bcf59ba9f19bc85"
            data-target-legacy-id="5280398"
            data-position="9"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/3/b9315edd0f2e3fbd9bcf59ba9f19bc85">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/debats/editoriaux/2020-07-06/il-faut-qu-on-parle-de-votre-identite-numerique.php" class="editorsChoiceCard__cover" title="Il faut qu’on parle de votre identité numérique">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/183005cd-bef7-11ea-b33c-02fe89184577.jpg" alt=" Il faut qu’on parle de votre identité numérique)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-DEB">Débats</div>
                <div class="sectionDash sectionDash--section-DEB"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/debats/editoriaux/2020-07-06/il-faut-qu-on-parle-de-votre-identite-numerique.php" title="Il faut qu’on parle de votre identité numérique"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/debats/editoriaux/2020-07-06/il-faut-qu-on-parle-de-votre-identite-numerique.php" title="Il faut qu’on parle de votre identité numérique">
                        Il faut qu’on parle de votre identité numérique
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 5h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-10
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-ART
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="00dd1e49095236ee8fcb80e586a5d747"
            data-target-legacy-id="5280391"
            data-position="10"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/00dd1e49095236ee8fcb80e586a5d747">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/arts/musique/2020-07-06/unfullow-the-rules-classique-rufus-wainwright.php" class="editorsChoiceCard__cover" title="Unfullow the Rules : classique Rufus Wainwright">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/fab29946-bc6f-11ea-b33c-02fe89184577.jpg" alt=" Unfullow the Rules : classique Rufus Wainwright)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/musique/2020-07-06/unfullow-the-rules-classique-rufus-wainwright.php" title="Unfullow the Rules : classique Rufus Wainwright"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/arts/musique/2020-07-06/unfullow-the-rules-classique-rufus-wainwright.php" title="Unfullow the Rules : classique Rufus Wainwright">
                        <em>Unfullow the Rules </em>: classique Rufus Wainwright
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 7h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-11
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-AFF
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="de5882ea804a327d959502f911a8e8ed"
            data-target-legacy-id="5280409"
            data-position="11"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/de5882ea804a327d959502f911a8e8ed">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/face-a-la-crise-la-dentiste-qui-voulait-faire-bouger-les-choses.php" class="editorsChoiceCard__cover" title="Face à la crise: la dentiste qui voulait faire bouger les choses">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/bc7b45c8-bf29-11ea-b33c-02fe89184577.jpg" alt=" Face à la crise: la dentiste qui voulait faire bouger les choses)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/face-a-la-crise-la-dentiste-qui-voulait-faire-bouger-les-choses.php" title="Face à la crise: la dentiste qui voulait faire bouger les choses"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/face-a-la-crise-la-dentiste-qui-voulait-faire-bouger-les-choses.php" title="Face à la crise: la dentiste qui voulait faire bouger les choses">
                        Face à la crise: la dentiste qui voulait faire bouger les choses
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 7h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-12
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-ART
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="659ee0c34ad53e8097269875c62ca0a4"
            data-target-legacy-id="5280393"
            data-position="12"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/659ee0c34ad53e8097269875c62ca0a4">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/arts/2020-07-06/maude-guerin-en-cinq-roles-marquants.php" class="editorsChoiceCard__cover" title="Maude Guérin en cinq rôles marquants">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/de621b60-b56f-11ea-b33c-02fe89184577.jpg" alt=" Maude Guérin en cinq rôles marquants)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/2020-07-06/maude-guerin-en-cinq-roles-marquants.php" title="Maude Guérin en cinq rôles marquants"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/arts/2020-07-06/maude-guerin-en-cinq-roles-marquants.php" title="Maude Guérin en cinq rôles marquants">
                        Maude Guérin en cinq rôles marquants
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 8h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-13
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-INT
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="c579835c38d53a0a90dab5e3fc1e5bac"
            data-target-legacy-id="5280397"
            data-position="13"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/c579835c38d53a0a90dab5e3fc1e5bac">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/affaire-epstein-les-secrets-de-ghislaine-maxwell.php" class="editorsChoiceCard__cover" title="Affaire Epstein: les secrets de Ghislaine Maxwell">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/499745e9-bf17-11ea-b33c-02fe89184577.jpg" alt=" Affaire Epstein: les secrets de Ghislaine Maxwell)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/affaire-epstein-les-secrets-de-ghislaine-maxwell.php" title="Affaire Epstein: les secrets de Ghislaine Maxwell"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/affaire-epstein-les-secrets-de-ghislaine-maxwell.php" title="Affaire Epstein: les secrets de Ghislaine Maxwell">
                        Affaire Epstein: les secrets de Ghislaine Maxwell
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 5h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-14
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-AFF
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="4c3cf3792c0b3fffbd97dcd5850fb472"
            data-target-legacy-id="5280403"
            data-position="14"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/4c3cf3792c0b3fffbd97dcd5850fb472">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/reacts-une-pme-propulsee-par-un-geant-mondial.php" class="editorsChoiceCard__cover" title="Reacts: une PME propulsée par un géant mondial">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/d30b03bd-bf25-11ea-b33c-02fe89184577.jpg" alt=" Reacts: une PME propulsée par un géant mondial)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/reacts-une-pme-propulsee-par-un-geant-mondial.php" title="Reacts: une PME propulsée par un géant mondial"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/affaires/entreprises/2020-07-06/reacts-une-pme-propulsee-par-un-geant-mondial.php" title="Reacts: une PME propulsée par un géant mondial">
                        Reacts: une PME propulsée par un géant mondial
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 6h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-15
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-INT
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="79f90c920d413b8db19b102d01cdcbfe"
            data-target-legacy-id="5280399"
            data-position="15"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/79f90c920d413b8db19b102d01cdcbfe">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/international/europe/2020-07-06/colonisation-du-congo-des-regrets-pas-des-excuses.php" class="editorsChoiceCard__cover" title="Colonisation du Congo: des regrets, pas des excuses…">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/93ad4ddb-bf1d-11ea-b33c-02fe89184577.jpg" alt=" Colonisation du Congo: des regrets, pas des excuses…)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/colonisation-du-congo-des-regrets-pas-des-excuses.php" title="Colonisation du Congo: des regrets, pas des excuses…"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/colonisation-du-congo-des-regrets-pas-des-excuses.php" title="Colonisation du Congo: des regrets, pas des excuses…">
                        Colonisation du Congo: des regrets, pas des excuses…
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 6h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="editorsChoice__item ">
    <article class="
                storyCard
                storyCard--position-16
                editorsChoiceCard
                editorsChoiceCard--size-small
                editorsChoiceCard--section-SPO
                editorsChoiceCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="9cfc1f1e486434518d411d9060575a29"
            data-target-legacy-id="5280410"
            data-position="16"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/9cfc1f1e486434518d411d9060575a29">
        </div>
        <div class="editorsChoiceCard__inner">
            <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/une-annee-riche-en-emotions-pour-aboubacar-sissoko.php" class="editorsChoiceCard__cover" title="Une année riche en émotions pour Aboubacar Sissoko">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/b243e1d7-befa-11ea-b33c-02fe89184577.jpg" alt=" Une année riche en émotions pour Aboubacar Sissoko)"/>
                                            </a>
                        <div class="editorsChoiceCard__details">
                <div class="editorsChoiceCard__tag"></div>
                <div class="editorsChoiceCard__label editorsChoiceCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="editorsChoiceCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/une-annee-riche-en-emotions-pour-aboubacar-sissoko.php" title="Une année riche en émotions pour Aboubacar Sissoko"></a>
                </span>
                <h2 class="storyCard__title editorsChoiceCard__title ">
                    <a href="https://www.lapresse.ca/sports/soccer/2020-07-06/une-annee-riche-en-emotions-pour-aboubacar-sissoko.php" title="Une année riche en émotions pour Aboubacar Sissoko">
                        Une année riche en émotions pour Aboubacar Sissoko
                    </a>
                </h2>
                                <p class="editorsChoiceCard__publicationDates">
                    
    <span>Publié à 7h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

</ul>

    </div>

    <div class="homeRow homeRow--wrapper-pub">
        <div class="adsWrapper greyLineToppedBox">
            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2aed48-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2aed48-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2aed48-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos3"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2aed48-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2aed48-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[[300,250],[300,600]],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2aed48-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

        </div>
            </div>

            <div class="
                homeRow
                homeSectionHeadlines
                homeSectionHeadlines--section-XTR
                homeSectionHeadlines--layout-row
                homeSectionHeadlines--itemPerRow-4
                pageBlock--emplacement-homePageSectionHeadlinesXTRA
            "
             data-location="home-xtra"
        >
            <h2 class="subHeader subHeader--section-XTR subHeader__link">
                <a data-target-type="section" href="https://www.lapresse.ca/xtra/">
                    XTRA
                </a>
                <span class="homeSectionHeadlines__subtitle subHeader__subTitle subHeader__subTitle--section-XTR"
                      data-toggle-class="whatIsAnXtra__displayed"
                      data-toggle-class-target=".whatIsAnXtra">
                    Qu'est-ce qu'un XTRA ?
                    <span class="whatIsAnXtra">
                        <span class="whatIsAnXtra__title">Qu’est-ce qu’un XTRA ?</span>
                        <span>XTRA est une section qui regroupe des contenus promotionnels produits par ou pour des annonceurs.</span>
                        <span class="whatIsAnXtra__close">&nbsp;</span>
                    </span>
                </span>
            </h2>
            <ul>
            <li>
            <article class="
                        storyCard
                        storyCard--position-1
                        homeXtraCard
                        homeXtraCard--size-medium
                        homeXtraCard--section-XTR
                     "
                     data-target-type="story"
                     data-target-id="ac7ecdb2b55f3b76af64a06de0e26664"
                     data-target-legacy-id="5279255"
                     data-position="1"
            >
                <div class="homeXtraCard__inner">
                    <a href="https://www.lapresse.ca/xtra/2020-07-05/gouvernement-du-quebec/covid-19-on-profite-de-l-ete-en-continuant-de-se-proteger.php" class="homeXtraCard__cover" title="COVID-19 : On profite de l’été en continuant de se protéger !">
                        <picture>
                            <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/acaaf73a-b7d5-11ea-b33c-02fe89184577.jpg">
                            <source media="(min-width: 1024x)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/acaaf73a-b7d5-11ea-b33c-02fe89184577.jpg">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/acaaf73a-b7d5-11ea-b33c-02fe89184577.jpg" alt="Gouvernement du Québec COVID-19 : On profite de l’été en continuant de se protéger !)">
                        </picture>
                                            </a>
                    <div class="homeXtraCard__details">
                        <div class="homeXtraCard__tag"></div>
                        
                        <div class="sectionDash sectionDash--section-XTR"></div>
                        <span class="homeXtraCard__suptitle"><a href="https://www.lapresse.ca/xtra/2020-07-05/gouvernement-du-quebec/covid-19-on-profite-de-l-ete-en-continuant-de-se-proteger.php" title="COVID-19 : On profite de l’été en continuant de se protéger !">Gouvernement du Québec</a></span>
                        <h2 class="homeXtraCard__title"><a href="https://www.lapresse.ca/xtra/2020-07-05/gouvernement-du-quebec/covid-19-on-profite-de-l-ete-en-continuant-de-se-proteger.php" title="COVID-19 : On profite de l’été en continuant de se protéger !">COVID-19 : On profite de l’été en continuant de se protéger !</a></h2>
                    </div>
                </div>
            </article>
        </li>
            <li>
            <article class="
                        storyCard
                        storyCard--position-2
                        homeXtraCard
                        homeXtraCard--size-medium
                        homeXtraCard--section-XTR
                     "
                     data-target-type="story"
                     data-target-id="c7d3b6e9a2e833b38b5c3a0557011e34"
                     data-target-legacy-id="5280008"
                     data-position="2"
            >
                <div class="homeXtraCard__inner">
                    <a href="https://www.lapresse.ca/xtra/2020-07-04/le-porc-du-quebec/7-trucs-de-pro-pour-du-bbq-cuit-a-la-perfection.php" class="homeXtraCard__cover" title="7 trucs de pro pour du BBQ cuit à la perfection">
                        <picture>
                            <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/7a1d1d54-bc66-11ea-b33c-02fe89184577.png">
                            <source media="(min-width: 1024x)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/7a1d1d54-bc66-11ea-b33c-02fe89184577.png">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/7a1d1d54-bc66-11ea-b33c-02fe89184577.png" alt="Le porc du Québec 7 trucs de pro pour du BBQ cuit à la perfection)">
                        </picture>
                                            </a>
                    <div class="homeXtraCard__details">
                        <div class="homeXtraCard__tag"></div>
                        
                        <div class="sectionDash sectionDash--section-XTR"></div>
                        <span class="homeXtraCard__suptitle"><a href="https://www.lapresse.ca/xtra/2020-07-04/le-porc-du-quebec/7-trucs-de-pro-pour-du-bbq-cuit-a-la-perfection.php" title="7 trucs de pro pour du BBQ cuit à la perfection">Le porc du Québec</a></span>
                        <h2 class="homeXtraCard__title"><a href="https://www.lapresse.ca/xtra/2020-07-04/le-porc-du-quebec/7-trucs-de-pro-pour-du-bbq-cuit-a-la-perfection.php" title="7 trucs de pro pour du BBQ cuit à la perfection">7 trucs de pro pour du BBQ cuit à la perfection</a></h2>
                    </div>
                </div>
            </article>
        </li>
            <li>
            <article class="
                        storyCard
                        storyCard--position-3
                        homeXtraCard
                        homeXtraCard--size-medium
                        homeXtraCard--section-XTR
                     "
                     data-target-type="story"
                     data-target-id="96f8e6bc047737cd9f34b6e89dc167a3"
                     data-target-legacy-id="5278883"
                     data-position="3"
            >
                <div class="homeXtraCard__inner">
                    <a href="https://www.lapresse.ca/xtra/2020-06-28/miralis/reinventer-la-cuisine-d-aujourd-hui-pour-demain.php" class="homeXtraCard__cover" title="Réinventer la cuisine d’aujourd’hui… pour demain">
                        <picture>
                            <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/3e51b350-b241-11ea-b33c-02fe89184577.jpg">
                            <source media="(min-width: 1024x)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/3e51b350-b241-11ea-b33c-02fe89184577.jpg">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3e51b350-b241-11ea-b33c-02fe89184577.jpg" alt="Miralis Réinventer la cuisine d’aujourd’hui… pour demain)">
                        </picture>
                                            </a>
                    <div class="homeXtraCard__details">
                        <div class="homeXtraCard__tag"></div>
                        
                        <div class="sectionDash sectionDash--section-XTR"></div>
                        <span class="homeXtraCard__suptitle"><a href="https://www.lapresse.ca/xtra/2020-06-28/miralis/reinventer-la-cuisine-d-aujourd-hui-pour-demain.php" title="Réinventer la cuisine d’aujourd’hui… pour demain">Miralis</a></span>
                        <h2 class="homeXtraCard__title"><a href="https://www.lapresse.ca/xtra/2020-06-28/miralis/reinventer-la-cuisine-d-aujourd-hui-pour-demain.php" title="Réinventer la cuisine d’aujourd’hui… pour demain">Réinventer la cuisine d’aujourd’hui… pour demain</a></h2>
                    </div>
                </div>
            </article>
        </li>
            <li>
            <article class="
                        storyCard
                        storyCard--position-4
                        homeXtraCard
                        homeXtraCard--size-medium
                        homeXtraCard--section-XTR
                     "
                     data-target-type="story"
                     data-target-id="6020c1c78d433f5d81c4ee367524a849"
                     data-target-legacy-id="5278742"
                     data-position="4"
            >
                <div class="homeXtraCard__inner">
                    <a href="https://www.lapresse.ca/xtra/2020-06-25/infopresse/formations-en-ligne-infopresse-les-meilleurs-experts-aident-les-professionnels-du-quebec" class="homeXtraCard__cover" title="Formations en ligne Infopresse : les meilleurs experts aident les professionnels du Québec">
                        <picture>
                            <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/ee1177a5-b488-11ea-b33c-02fe89184577.jpg">
                            <source media="(min-width: 1024x)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/ee1177a5-b488-11ea-b33c-02fe89184577.jpg">
                            <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/ee1177a5-b488-11ea-b33c-02fe89184577.jpg" alt="Infopresse Formations en ligne Infopresse : les meilleurs experts aident les professionnels du Québec)">
                        </picture>
                                            </a>
                    <div class="homeXtraCard__details">
                        <div class="homeXtraCard__tag"></div>
                        
                        <div class="sectionDash sectionDash--section-XTR"></div>
                        <span class="homeXtraCard__suptitle"><a href="https://www.lapresse.ca/xtra/2020-06-25/infopresse/formations-en-ligne-infopresse-les-meilleurs-experts-aident-les-professionnels-du-quebec" title="Formations en ligne Infopresse : les meilleurs experts aident les professionnels du Québec">Infopresse</a></span>
                        <h2 class="homeXtraCard__title"><a href="https://www.lapresse.ca/xtra/2020-06-25/infopresse/formations-en-ligne-infopresse-les-meilleurs-experts-aident-les-professionnels-du-quebec" title="Formations en ligne Infopresse : les meilleurs experts aident les professionnels du Québec">Formations en ligne Infopresse : les meilleurs experts aident les...</a></h2>
                    </div>
                </div>
            </article>
        </li>
    </ul>

        </div>
    
    <div class="homeRow videosHub pageBlock--emplacement-homePageVideos">
        <h2 class="subHeader subHeader--type-video">Vidéos</h2>
        
<ul class="videosHub__horizontalList">
    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-1
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-SPO
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="da4887836735338687b8b72a00cc1dbb"
            data-target-legacy-id="5280514"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/5/da4887836735338687b8b72a00cc1dbb">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" class="videosHubCard__cover" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/caf252d8/c0e8d0dd-bfd2-11ea-b33c-02fe89184577.jpg" alt=" Price, Weber et Gallagher sur la patinoire à Brossard)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:36</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-SPO"></div>
                <div class="sectionDash sectionDash--section-SPO"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/sports/hockey/2020-07-06/price-weber-et-gallagher-sur-la-patinoire-a-brossard.php" title="Price, Weber et Gallagher sur la patinoire à Brossard">
                        Price, Weber et Gallagher sur la patinoire à Brossard
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 17h51</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 18h50</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-2
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-INT
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d76e9fbfa1503df2b5415145074af531"
            data-target-legacy-id="5280496"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/d76e9fbfa1503df2b5415145074af531">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/international/europe/2020-07-06/le-commonwealth-devrait-se-confronter-a-son-passe-colonial-dit-le-prince-harry.php" class="videosHubCard__cover" title="Le Commonwealth devrait se confronter à son passé colonial, dit le prince Harry">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/db30411d/867734cd-bfbb-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/db30411d/867734cd-bfbb-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/db30411d/867734cd-bfbb-11ea-b33c-02fe89184577.jpg" alt=" Le Commonwealth devrait se confronter à son passé colonial, dit le prince Harry)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>02:04</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/le-commonwealth-devrait-se-confronter-a-son-passe-colonial-dit-le-prince-harry.php" title="Le Commonwealth devrait se confronter à son passé colonial, dit le prince Harry"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/international/europe/2020-07-06/le-commonwealth-devrait-se-confronter-a-son-passe-colonial-dit-le-prince-harry.php" title="Le Commonwealth devrait se confronter à son passé colonial, dit le prince Harry">
                        Le Commonwealth devrait se confronter à son passé colonial, dit le prince Harry
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 15h07</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 16h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-3
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-ART
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="73c4e539c2a631269d28e66d82e853d5"
            data-target-legacy-id="5280479"
            data-position="3"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/7/73c4e539c2a631269d28e66d82e853d5">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" class="videosHubCard__cover" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/856029ec-bfc4-11ea-b33c-02fe89184577.jpg" alt=" Mort d’Aubert Pallascio, un acteur très doué et très discret)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>00:51</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-ART"></div>
                <div class="sectionDash sectionDash--section-ART"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" title="Mort d’Aubert Pallascio, un acteur très doué et très discret"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/arts/television/2020-07-06/mort-d-aubert-pallascio-un-acteur-tres-doue-et-tres-discret.php" title="Mort d’Aubert Pallascio, un acteur très doué et très discret">
                        Mort d’Aubert Pallascio, un acteur très doué et très discret
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 13h02</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 14h34</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-4
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-ACT
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="826cb0437f6d3b518a82f8b695d007be"
            data-target-legacy-id="5280484"
            data-position="4"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/258/826cb0437f6d3b518a82f8b695d007be">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" class="videosHubCard__cover" title="Débordements dans les bars: Dubé promet amendes et fermetures">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/bae12342/f1b3f40e-bfab-11ea-b33c-02fe89184577.jpg" alt=" Débordements dans les bars: Dubé promet amendes et fermetures)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>02:07</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" title="Débordements dans les bars: Dubé promet amendes et fermetures"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/covid-19/2020-07-06/debordements-dans-les-bars-dube-promet-amendes-et-fermetures.php" title="Débordements dans les bars: Dubé promet amendes et fermetures">
                        Débordements dans les bars: Dubé promet amendes et fermetures
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 13h04</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 13h58</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-5
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-ACT
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="93c7b6646fc736fd9a726c5d9d169efc"
            data-target-legacy-id="5280434"
            data-position="5"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/93c7b6646fc736fd9a726c5d9d169efc">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/actualites/2020-07-06/avertissement-de-chaleur-pour-la-region-de-montreal.php" class="videosHubCard__cover" title="Avertissement de chaleur pour la région de Montréal">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/8c26b8c4-bf89-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/8c26b8c4-bf89-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8c26b8c4-bf89-11ea-b33c-02fe89184577.jpg" alt=" Avertissement de chaleur pour la région de Montréal)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:03</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/2020-07-06/avertissement-de-chaleur-pour-la-region-de-montreal.php" title="Avertissement de chaleur pour la région de Montréal"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/actualites/2020-07-06/avertissement-de-chaleur-pour-la-region-de-montreal.php" title="Avertissement de chaleur pour la région de Montréal">
                        Avertissement de chaleur pour la région de Montréal
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 9h07</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 9h50</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-6
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-INT
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="980a968c87ca3a73ad263582edb852da"
            data-target-legacy-id="5280456"
            data-position="6"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/2/980a968c87ca3a73ad263582edb852da">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/l-ex-collaboratrice-de-jeffrey-epstein-attendue-vendredi-au-tribunal-a-new-york.php" class="videosHubCard__cover" title="L’ex-collaboratrice de Jeffrey Epstein attendue vendredi au tribunal à New York">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/28d63b9d-bf98-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/28d63b9d-bf98-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/28d63b9d-bf98-11ea-b33c-02fe89184577.jpg" alt=" L’ex-collaboratrice de Jeffrey Epstein attendue vendredi au tribunal à New York)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:13</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-INT"></div>
                <div class="sectionDash sectionDash--section-INT"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/l-ex-collaboratrice-de-jeffrey-epstein-attendue-vendredi-au-tribunal-a-new-york.php" title="L’ex-collaboratrice de Jeffrey Epstein attendue vendredi au tribunal à New York"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/international/etats-unis/2020-07-06/l-ex-collaboratrice-de-jeffrey-epstein-attendue-vendredi-au-tribunal-a-new-york.php" title="L’ex-collaboratrice de Jeffrey Epstein attendue vendredi au tribunal à New York">
                        L’ex-collaboratrice de Jeffrey Epstein attendue vendredi au tribunal à New York
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 10h52</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 13h14</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-7
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-ACT
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="5eca37e1a88534179e24893d83932411"
            data-target-legacy-id="5280455"
            data-position="7"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/5eca37e1a88534179e24893d83932411">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" class="videosHubCard__cover" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/5787f1b6-bf97-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/5787f1b6-bf97-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/5787f1b6-bf97-11ea-b33c-02fe89184577.jpg" alt=" Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:08</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/actualites/politique/2020-07-06/une-nouvelle-course-pour-un-siege-au-conseil-de-securite-bob-rae-use-de-prudence.php" title="Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de prudence">
                        Une nouvelle course pour un siège au Conseil de sécurité? Bob Rae use de...
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 10h47</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 17h46</span>

                </p>
            </div>
        </div>
    </article>
</li>

    

        
<li class="videosHub__item ">
    <article class="
                storyCard
                storyCard--position-8
                videosHubCard
                videosHubCard--size-medium
                videosHubCard--section-CIN
                videosHubCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="4ef617f12b3234e78cd0b1cfded15094"
            data-target-legacy-id="5280419"
            data-position="8"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/8/4ef617f12b3234e78cd0b1cfded15094">
        </div>
        <div class="videosHubCard__inner">
            <a href="https://www.lapresse.ca/cinema/2020-07-06/le-compositeur-italien-ennio-morricone-s-eteint-a-91-ans.php" class="videosHubCard__cover" title="Le compositeur italien Ennio Morricone s’éteint à 91 ans">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/3da58153/1c164596-bf73-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/3da58153/1c164596-bf73-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3da58153/1c164596-bf73-11ea-b33c-02fe89184577.jpg" alt=" Le compositeur italien Ennio Morricone s’éteint à 91 ans)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:17</span>
</span>

                            </a>
                        <div class="videosHubCard__details">
                <div class="videosHubCard__tag"></div>
                <div class="videosHubCard__label videosHubCard__label--section-CIN"></div>
                <div class="sectionDash sectionDash--section-CIN"></div>
                <span class="videosHubCard__suptitle ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/le-compositeur-italien-ennio-morricone-s-eteint-a-91-ans.php" title="Le compositeur italien Ennio Morricone s’éteint à 91 ans"></a>
                </span>
                <h2 class="storyCard__title videosHubCard__title ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/le-compositeur-italien-ennio-morricone-s-eteint-a-91-ans.php" title="Le compositeur italien Ennio Morricone s’éteint à 91 ans">
                        Le compositeur italien Ennio Morricone s’éteint à 91 ans
                    </a>
                </h2>
                                <p class="videosHubCard__publicationDates">
                    
    <span>Publié à 6h30</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 7h53</span>

                </p>
            </div>
        </div>
    </article>
</li>

</ul>

    </div>

    <div class="homeRow homeRow--wrapper-pub">
        <div class="adsWrapper greyLineToppedBox">
            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2b3a5b-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2b3a5b-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2b3a5b-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos4"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2b3a5b-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2b3a5b-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[[300,250],[300,600]],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2b3a5b-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

        </div>
            </div>

    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines5" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ACT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/actualites/environnement/"
        >
            Environnement
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="bb7fdd8d51be3b33a606965c1810af5f"
            data-target-legacy-id="5280379"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/bb7fdd8d51be3b33a606965c1810af5f">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/environnement/2020-07-05/rechauffement-climatique-fonte-de-51-des-glaciers-du-perou-en-50-ans.php" class="homeSectionHeadlinesCard__cover" title="Réchauffement climatique: fonte de 51% des glaciers du Pérou en 50 ans">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/9f7bab43-bef1-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/9f7bab43-bef1-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/9f7bab43-bef1-11ea-b33c-02fe89184577.jpg" alt=" Réchauffement climatique: fonte de 51% des glaciers du Pérou en 50 ans)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/environnement/2020-07-05/rechauffement-climatique-fonte-de-51-des-glaciers-du-perou-en-50-ans.php" title="Réchauffement climatique: fonte de 51% des glaciers du Pérou en 50 ans"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/environnement/2020-07-05/rechauffement-climatique-fonte-de-51-des-glaciers-du-perou-en-50-ans.php" title="Réchauffement climatique: fonte de 51% des glaciers du Pérou en 50 ans">
                        Réchauffement climatique: fonte de 51% des glaciers du Pérou en 50 ans
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié hier à 15h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="1960f6a52a483a5488d48ef51070e307"
            data-target-legacy-id="5280280"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/1960f6a52a483a5488d48ef51070e307">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/environnement/2020-07-04/rechauffement-climatique-les-castors-se-deplacent-vers-le-nord.php" class="homeSectionHeadlinesCard__cover" title="Réchauffement climatique: les castors se déplacent vers le Nord">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/bf00646b-bdff-11ea-b33c-02fe89184577.jpg" alt=" Réchauffement climatique: les castors se déplacent vers le Nord)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/environnement/2020-07-04/rechauffement-climatique-les-castors-se-deplacent-vers-le-nord.php" title="Réchauffement climatique: les castors se déplacent vers le Nord"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/environnement/2020-07-04/rechauffement-climatique-les-castors-se-deplacent-vers-le-nord.php" title="Réchauffement climatique: les castors se déplacent vers le Nord">
                        Réchauffement climatique: les castors se déplacent vers le Nord
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 4 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ACT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/actualites/sciences/"
        >
            Sciences
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="ea4bb21979b53e31847689dedf484348"
            data-target-legacy-id="5280376"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/ea4bb21979b53e31847689dedf484348">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/la-mysterieuse-neige-rose-d-un-glacier-des-alpes-italiennes.php" class="homeSectionHeadlinesCard__cover" title="La mystérieuse neige rose d’un glacier des Alpes italiennes">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/22ea1fcc-bee6-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/22ea1fcc-bee6-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/22ea1fcc-bee6-11ea-b33c-02fe89184577.jpg" alt=" La mystérieuse neige rose d’un glacier des Alpes italiennes)">
                    </picture>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:00</span>
</span>

                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/la-mysterieuse-neige-rose-d-un-glacier-des-alpes-italiennes.php" title="La mystérieuse neige rose d’un glacier des Alpes italiennes"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/la-mysterieuse-neige-rose-d-un-glacier-des-alpes-italiennes.php" title="La mystérieuse neige rose d’un glacier des Alpes italiennes">
                        La mystérieuse neige rose d’un glacier des Alpes italiennes
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié hier à 13h54</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d06e9f9eedd2365b898007479248f689"
            data-target-legacy-id="5280340"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/d06e9f9eedd2365b898007479248f689">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/l-actualite-scientifique-a-petites-doses.php" class="homeSectionHeadlinesCard__cover" title="L’actualité scientifique à petites doses">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/7ef0c7fe-b6fc-11ea-b33c-02fe89184577.jpg" alt=" L’actualité scientifique à petites doses)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/l-actualite-scientifique-a-petites-doses.php" title="L’actualité scientifique à petites doses"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/sciences/2020-07-05/l-actualite-scientifique-a-petites-doses.php" title="L’actualité scientifique à petites doses">
                        L’actualité scientifique à petites doses
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié hier à 6h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

            <div class="homeRow homeRow--wrapper-pub">
            <div class="adsWrapper greyLineToppedBox">
                <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2b5fac-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2b5fac-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2b5fac-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos5"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2b5fac-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2b5fac-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2b5fac-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

            </div>
                    </div>
    
    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines6" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-SOC"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/societe/"
        >
            Société
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-SOC
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="b50ffc73ed6338d4acea2c38a9eee0e2"
            data-target-legacy-id="5280389"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/b50ffc73ed6338d4acea2c38a9eee0e2">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" class="homeSectionHeadlinesCard__cover" title="Les camps de vacances, icônes culturelles">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4cbede94/8910f64e-ba3e-11ea-b33c-02fe89184577.jpg" alt=" Les camps de vacances, icônes culturelles)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/societe/2020-07-06/les-camps-de-vacances-icones-culturelles.php" title="Les camps de vacances, icônes culturelles">
                        Les camps de vacances, icônes culturelles
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-SOC
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="9060800e6f0d35d589896a396c8450b3"
            data-target-legacy-id="5280475"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/9/9060800e6f0d35d589896a396c8450b3">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/societe/mode-et-beaute/2020-07-06/naomi-campbell-appelle-a-l-inclusion-dans-le-milieu-de-la-mode.php" class="homeSectionHeadlinesCard__cover" title="Naomi Campbell appelle à l’inclusion dans le milieu de la mode">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/6b1a841a-bfa5-11ea-b33c-02fe89184577.jpg" alt=" Naomi Campbell appelle à l’inclusion dans le milieu de la mode)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-SOC"></div>
                <div class="sectionDash sectionDash--section-SOC"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/societe/mode-et-beaute/2020-07-06/naomi-campbell-appelle-a-l-inclusion-dans-le-milieu-de-la-mode.php" title="Naomi Campbell appelle à l’inclusion dans le milieu de la mode"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/societe/mode-et-beaute/2020-07-06/naomi-campbell-appelle-a-l-inclusion-dans-le-milieu-de-la-mode.php" title="Naomi Campbell appelle à l’inclusion dans le milieu de la mode">
                        Naomi Campbell appelle à l’inclusion dans le milieu de la mode
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 13h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-VOY"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/voyage/"
        >
            Voyage
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-VOY
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="165093471d36346e9f02d757cd4d701e"
            data-target-legacy-id="5280384"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/11/165093471d36346e9f02d757cd4d701e">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" class="homeSectionHeadlinesCard__cover" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/258f0605-b1af-11ea-b33c-02fe89184577.jpg" alt=" Gérard Bodard et Richard Chartrand: les rois des Zingues)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-VOY"></div>
                <div class="sectionDash sectionDash--section-VOY"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/voyage/plein-air/2020-07-06/gerard-bodard-et-richard-chartrand-les-rois-des-zingues.php" title="Gérard Bodard et Richard Chartrand: les rois des Zingues">
                        Gérard Bodard et Richard Chartrand: les rois des Zingues
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-VOY
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="9f7ab0973f4a39c5b2e0d0975df3bab7"
            data-target-legacy-id="5280457"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/11/9f7ab0973f4a39c5b2e0d0975df3bab7">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/voyage/asie/2020-07-06/bali-prevoit-rouvrir-aux-touristes-internationaux-en-septembre.php" class="homeSectionHeadlinesCard__cover" title="Bali prévoit rouvrir aux touristes internationaux en septembre">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/4596a886-bf98-11ea-b33c-02fe89184577.jpg" alt=" Bali prévoit rouvrir aux touristes internationaux en septembre)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-VOY"></div>
                <div class="sectionDash sectionDash--section-VOY"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/voyage/asie/2020-07-06/bali-prevoit-rouvrir-aux-touristes-internationaux-en-septembre.php" title="Bali prévoit rouvrir aux touristes internationaux en septembre"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/voyage/asie/2020-07-06/bali-prevoit-rouvrir-aux-touristes-internationaux-en-septembre.php" title="Bali prévoit rouvrir aux touristes internationaux en septembre">
                        Bali prévoit rouvrir aux touristes internationaux en septembre
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 10h52</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

    
    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines7" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-AUT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/auto/"
        >
            Auto
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-AUT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="89e279bc42eb308c94957c65a366f46d"
            data-target-legacy-id="5280445"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/6/89e279bc42eb308c94957c65a366f46d">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" class="homeSectionHeadlinesCard__cover" title="F-150 2021: Ford présente la 14e génération de son best-seller">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/ce891fdc-bc8a-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/ce891fdc-bc8a-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/ce891fdc-bc8a-11ea-b33c-02fe89184577.jpg" alt=" F-150 2021: Ford présente la 14e génération de son best-seller)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AUT"></div>
                <div class="sectionDash sectionDash--section-AUT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" title="F-150 2021: Ford présente la 14e génération de son best-seller"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/auto/guide-auto/2020-07-06/f-150-2021-ford-presente-la-14e-generation-de-son-best-seller.php" title="F-150 2021: Ford présente la 14e génération de son best-seller">
                        F-150 2021: Ford présente la 14<sup>e</sup> génération de son <em>best-seller</em>
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h45</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-AUT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="42ce30abb77e3719a592e83f2f9ff83b"
            data-target-legacy-id="5280438"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/6/42ce30abb77e3719a592e83f2f9ff83b">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/auto/rappels/2020-07-06/rappel-de-toyota-prius-pour-un-probleme-du-systeme-hybride.php" class="homeSectionHeadlinesCard__cover" title="Rappel de Toyota Prius pour un problème du système hybride">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/49bb6e93-bf8d-11ea-b33c-02fe89184577.jpg" alt=" Rappel de Toyota Prius pour un problème du système hybride)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AUT"></div>
                <div class="sectionDash sectionDash--section-AUT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/auto/rappels/2020-07-06/rappel-de-toyota-prius-pour-un-probleme-du-systeme-hybride.php" title="Rappel de Toyota Prius pour un problème du système hybride"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/auto/rappels/2020-07-06/rappel-de-toyota-prius-pour-un-probleme-du-systeme-hybride.php" title="Rappel de Toyota Prius pour un problème du système hybride">
                        Rappel de Toyota Prius pour un problème du système hybride
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 9h45</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-MAI"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/maison/"
        >
            Maison
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-MAI
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="4037cd7d08ab3c1180b802ab64eb8012"
            data-target-legacy-id="5280459"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/12/4037cd7d08ab3c1180b802ab64eb8012">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" class="homeSectionHeadlinesCard__cover" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/0b3c8b92-bf99-11ea-b33c-02fe89184577.jpg" alt=" Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-MAI"></div>
                <div class="sectionDash sectionDash--section-MAI"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/maison/immobilier/2020-07-06/evolution-d-une-maison-au-bord-de-l-eau-a-saint-jean-sur-richelieu.php" title="Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu">
                        Évolution d’une maison au bord de l’eau à Saint-Jean-sur-Richelieu
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-MAI
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d00114cec59035ec82a60a7d8884cc08"
            data-target-legacy-id="5280172"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/12/d00114cec59035ec82a60a7d8884cc08">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/maison/architecture/2020-07-05/la-vie-cote-jardin-dans-la-petite-bourgogne.php" class="homeSectionHeadlinesCard__cover" title="La vie côté jardin dans la Petite-Bourgogne">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/faa302dc-bd3b-11ea-b33c-02fe89184577.jpg" alt=" La vie côté jardin dans la Petite-Bourgogne)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-MAI"></div>
                <div class="sectionDash sectionDash--section-MAI"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/maison/architecture/2020-07-05/la-vie-cote-jardin-dans-la-petite-bourgogne.php" title="La vie côté jardin dans la Petite-Bourgogne"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/maison/architecture/2020-07-05/la-vie-cote-jardin-dans-la-petite-bourgogne.php" title="La vie côté jardin dans la Petite-Bourgogne">
                        La vie côté jardin dans la Petite-Bourgogne
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié hier à 12h00</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

            <div class="homeRow homeRow--wrapper-pub">
            <div class="adsWrapper greyLineToppedBox">
                <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2b70dd-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2b70dd-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2b70dd-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos6"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2b70dd-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2b70dd-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2b70dd-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

            </div>
                    </div>
    
    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines8" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-GOU"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/gourmand/"
        >
            Gourmand
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-GOU
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="5174f7d8157332d1a2acc0029df9e4ec"
            data-target-legacy-id="5280453"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/80/5174f7d8157332d1a2acc0029df9e4ec">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/gourmand/restaurants/2020-07-06/le-retour-des-foires-alimentaires.php" class="homeSectionHeadlinesCard__cover" title="Le retour des foires alimentaires">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/3bf89252-bf95-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/3bf89252-bf95-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/3bf89252-bf95-11ea-b33c-02fe89184577.jpg" alt=" Le retour des foires alimentaires)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-GOU"></div>
                <div class="sectionDash sectionDash--section-GOU"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/gourmand/restaurants/2020-07-06/le-retour-des-foires-alimentaires.php" title="Le retour des foires alimentaires"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/gourmand/restaurants/2020-07-06/le-retour-des-foires-alimentaires.php" title="Le retour des foires alimentaires">
                        Le retour des foires alimentaires
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 11h15</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-GOU
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="09fcaf3675f630c6a5e6b4cb27a5e728"
            data-target-legacy-id="5280174"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/80/09fcaf3675f630c6a5e6b4cb27a5e728">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/gourmand/recettes/2020-07-04/la-cuisine-cajun-une-cuisine-de-diversite.php" class="homeSectionHeadlinesCard__cover" title="La cuisine cajun, une cuisine de diversité">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/f3770b26/688faedb-bd3d-11ea-b33c-02fe89184577.jpg" alt=" La cuisine cajun, une cuisine de diversité)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-GOU"></div>
                <div class="sectionDash sectionDash--section-GOU"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/gourmand/recettes/2020-07-04/la-cuisine-cajun-une-cuisine-de-diversite.php" title="La cuisine cajun, une cuisine de diversité"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/gourmand/recettes/2020-07-04/la-cuisine-cajun-une-cuisine-de-diversite.php" title="La cuisine cajun, une cuisine de diversité">
                        La cuisine cajun, une cuisine de diversité
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 4 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-GOU"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/gourmand/alcools/"
        >
            Alcools
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-GOU
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="9465ffd806ba347da735bcc3c6c1d393"
            data-target-legacy-id="5280176"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/80/9465ffd806ba347da735bcc3c6c1d393">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-04/vins-de-la-semaine-le-fruit-dans-tous-ses-etats.php" class="homeSectionHeadlinesCard__cover" title="Vins de la semaine : le fruit dans tous ses états">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/c6320fda-bd3e-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/c6320fda-bd3e-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/c6320fda-bd3e-11ea-b33c-02fe89184577.jpg" alt=" Vins de la semaine : le fruit dans tous ses états)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-GOU"></div>
                <div class="sectionDash sectionDash--section-GOU"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-04/vins-de-la-semaine-le-fruit-dans-tous-ses-etats.php" title="Vins de la semaine : le fruit dans tous ses états"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-04/vins-de-la-semaine-le-fruit-dans-tous-ses-etats.php" title="Vins de la semaine : le fruit dans tous ses états">
                        Vins de la semaine : le fruit dans tous ses états
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 4 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-GOU
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="ffd03330c0e63120b1d79aac7b939340"
            data-target-legacy-id="5280064"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/80/ffd03330c0e63120b1d79aac7b939340">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-03/un-hotel-4-etoiles-dans-les-vignes-en-champagne.php" class="homeSectionHeadlinesCard__cover" title="Un hôtel 4 étoiles dans les vignes en Champagne">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/d1292277-bc95-11ea-b33c-02fe89184577.jpg" alt=" Un hôtel 4 étoiles dans les vignes en Champagne)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-GOU"></div>
                <div class="sectionDash sectionDash--section-GOU"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-03/un-hotel-4-etoiles-dans-les-vignes-en-champagne.php" title="Un hôtel 4 étoiles dans les vignes en Champagne"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/gourmand/alcools/2020-07-03/un-hotel-4-etoiles-dans-les-vignes-en-champagne.php" title="Un hôtel 4 étoiles dans les vignes en Champagne">
                        Un hôtel 4 étoiles dans les vignes en Champagne
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 3 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

    <div class="homeRow homeRow--wrapper-pub">
        <div class="adsWrapper greyLineToppedBox">
            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2b84fd-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2b84fd-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2b84fd-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos7"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2b84fd-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2b84fd-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[[300,250],[300,600]],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2b84fd-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

        </div>
            </div>

    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines9" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-CIN"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/cinema/"
        >
            Cinéma
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-CIN
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d6530cb50e8839128f2faaa9283d0b39"
            data-target-legacy-id="5280437"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/8/d6530cb50e8839128f2faaa9283d0b39">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/cinema/2020-07-06/de-nombreuses-reactions-au-deces-d-ennio-morricone.php" class="homeSectionHeadlinesCard__cover" title="De nombreuses réactions au décès d’Ennio Morricone">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/791009b7/19dd9dac-bf8d-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/791009b7/19dd9dac-bf8d-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/791009b7/19dd9dac-bf8d-11ea-b33c-02fe89184577.jpg" alt=" De nombreuses réactions au décès d’Ennio Morricone)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-CIN"></div>
                <div class="sectionDash sectionDash--section-CIN"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/de-nombreuses-reactions-au-deces-d-ennio-morricone.php" title="De nombreuses réactions au décès d’Ennio Morricone"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/de-nombreuses-reactions-au-deces-d-ennio-morricone.php" title="De nombreuses réactions au décès d’Ennio Morricone">
                        De nombreuses réactions au décès d’Ennio Morricone
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 9h33</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-CIN
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="6d93924dd4bb3a388bb0c1864dba4f3c"
            data-target-legacy-id="5280442"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/8/6d93924dd4bb3a388bb0c1864dba4f3c">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/cinema/2020-07-06/les-musiques-de-films-les-plus-celebres-d-ennio-morricone.php" class="homeSectionHeadlinesCard__cover" title="Les musiques de films les plus célèbres d’Ennio Morricone">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/e2ac1abe-bf8e-11ea-b33c-02fe89184577.jpg" alt=" Les musiques de films les plus célèbres d’Ennio Morricone)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-CIN"></div>
                <div class="sectionDash sectionDash--section-CIN"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/les-musiques-de-films-les-plus-celebres-d-ennio-morricone.php" title="Les musiques de films les plus célèbres d’Ennio Morricone"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/cinema/2020-07-06/les-musiques-de-films-les-plus-celebres-d-ennio-morricone.php" title="Les musiques de films les plus célèbres d’Ennio Morricone">
                        Les musiques de films les plus célèbres d’Ennio Morricone
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 9h47</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-AFF"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/affaires/techno/"
        >
            Techno
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="11fa23ebc5a23199a0868ac1d24bdca1"
            data-target-legacy-id="5280426"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/11fa23ebc5a23199a0868ac1d24bdca1">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/londres-laisse-entendre-qu-il-pourrait-se-passer-de-huawei-pour-la-5g.php" class="homeSectionHeadlinesCard__cover" title="Londres laisse entendre qu’il pourrait se passer de Huawei pour la 5G">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/fc9f146b-bf7a-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/fc9f146b-bf7a-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/fc9f146b-bf7a-11ea-b33c-02fe89184577.jpg" alt=" Londres laisse entendre qu’il pourrait se passer de Huawei pour la 5G)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/londres-laisse-entendre-qu-il-pourrait-se-passer-de-huawei-pour-la-5g.php" title="Londres laisse entendre qu’il pourrait se passer de Huawei pour la 5G"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/londres-laisse-entendre-qu-il-pourrait-se-passer-de-huawei-pour-la-5g.php" title="Londres laisse entendre qu’il pourrait se passer de Huawei pour la 5G">
                        Londres laisse entendre qu’il pourrait se passer de Huawei pour la 5G
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 7h25</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 11h22</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="f6b7f68d9d1b3d929714502439e4c0ac"
            data-target-legacy-id="5280435"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/f6b7f68d9d1b3d929714502439e4c0ac">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/uber-avale-l-application-de-livraison-de-repas-postmates-pour-2-65-milliards-us.php" class="homeSectionHeadlinesCard__cover" title="Uber avale l’application de livraison de repas Postmates pour 2,65 milliards US">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8aee6592-bf87-11ea-b33c-02fe89184577.jpg" alt=" Uber avale l’application de livraison de repas Postmates pour 2,65 milliards US)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/uber-avale-l-application-de-livraison-de-repas-postmates-pour-2-65-milliards-us.php" title="Uber avale l’application de livraison de repas Postmates pour 2,65 milliards US"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/techno/2020-07-06/uber-avale-l-application-de-livraison-de-repas-postmates-pour-2-65-milliards-us.php" title="Uber avale l’application de livraison de repas Postmates pour 2,65 milliards US">
                        Uber avale l’application de livraison de repas Postmates pour 2,65 milliards US
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié à 9h09</span>
    <span class="homeHeadlinesCard__publicationUpdateDate">Mis à jour à 10h32</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

    <div class="homeRow homeRow--wrapper-pub">
        <div class="adsWrapper greyLineToppedBox">
            <div class="adSpotBlock wrapCenter pageBox isEmpty">
    <div id="ad5f03adf2b9df2-slotWrapper" class="slotWrapper adSpotBlock__slotWrapper">
        <div id="ad5f03adf2b9df2-adSlotLppos" class="adSlot adSpotBlock__slotInner">
        </div>
        <script data-name="ad5f03adf2b9df2-adSlotLppos" data-ads-meta="">
            (function () {
                var positionName
                var positionNamePrefix = "pos";
                                                positionName = "pos8"
                                var adSlot = document.querySelector("[data-name=ad5f03adf2b9df2-adSlotLppos]")

                if (positionName === undefined) {
                    var current = adSlot

                    while(current && (current.getAttribute && !current.getAttribute("data-ads-position-container"))) {
                        current = current.parentNode
                    }
                    if (current) {
                        positionName = positionNamePrefix + Array.prototype.slice.call(current.querySelectorAll(".adSlot")).length
                    }
                }

                googletag.cmd.push(function () {

                    var slotName = "ad5f03adf2b9df2-adSlotLppos";
                    var adUnitPath = '/' + [
                                nuglif.ngApp.globals.network,
                                nuglif.ngApp.globals.topLevelAdUnit,
                                nuglif.ngApp.globals.adUnit
                            ].join('/');

                    var mapping = null;
                    var slot
                    var dimensions = {"mobile":[[300,250],[300,600]],"lg":[[634,125],[634,150],[634,180],[634,200],[634,634],[634,400],[728,90],[970,250],[970,415]]}
                    if (!adsUtils.isArray(dimensions)) {
                        mappingBuilder = googletag.sizeMapping()

                        Object.keys(adsUtils.breakpoints).forEach(function(bpoint ) {
                            if (dimensions[bpoint]) {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], dimensions[bpoint])
                            } else {
                                mappingBuilder.addSize(adsUtils.breakpoints[bpoint], [])
                            }
                        })

                        mapping = mappingBuilder.build()

                        slot = googletag.defineSlot(adUnitPath, [[1, 1]], slotName)
                                .defineSizeMapping(mapping);

                    } else {
                        slot = googletag.defineSlot(adUnitPath, dimensions, slotName)
                    }

                    slot.setTargeting("position", positionName)
                            .setTargeting("pageBlock", "body")
                            .addService(googletag.pubads());

                    googletag.display(slotName);

                    document.querySelector('[data-name="ad5f03adf2b9df2-adSlotLppos"]').setAttribute('data-ads-meta', JSON.stringify({ position: positionName, pageBlock: 'body', dimensions: dimensions}))
                });

            })()
        </script>
    </div>
</div>

        </div>
            </div>

    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines10" data-location="home-section">
                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-AFF"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/affaires/portfolio/"
        >
            Portfolio
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="1307f13dbf9536cd99195e91ece0e327"
            data-target-legacy-id="5278050"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/1307f13dbf9536cd99195e91ece0e327">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/un-paillis-vert-que-s-arrachent-les-americains" class="homeSectionHeadlinesCard__cover" title="Un paillis vert que s’arrachent les Américains">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/036e4f14-ab2a-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/036e4f14-ab2a-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/036e4f14-ab2a-11ea-b33c-02fe89184577.jpg" alt="Laval Un paillis vert que s’arrachent les Américains)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/un-paillis-vert-que-s-arrachent-les-americains" title="Un paillis vert que s’arrachent les Américains">Laval</a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/un-paillis-vert-que-s-arrachent-les-americains" title="Un paillis vert que s’arrachent les Américains">
                        Un paillis vert que s’arrachent les Américains
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 17 juin</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="fa7aff938656373684691f46510e47c0"
            data-target-legacy-id="5278103"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/fa7aff938656373684691f46510e47c0">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/cite-de-la-biotech-a-l-assaut-de-la-covid-19" class="homeSectionHeadlinesCard__cover" title="Cité de la Biotech
À l’assaut de la COVID-19">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/d6dc11d0-b0ac-11ea-b33c-02fe89184577.jpg" alt="Laval Cité de la Biotech
À l’assaut de la COVID-19)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/cite-de-la-biotech-a-l-assaut-de-la-covid-19" title="Cité de la Biotech
À l’assaut de la COVID-19">Laval</a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/portfolio/2020-06-17/laval/cite-de-la-biotech-a-l-assaut-de-la-covid-19" title="Cité de la Biotech
À l’assaut de la COVID-19">
                        Cité de la Biotech
À l’assaut de la COVID-19
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 17 juin</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-ACT"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/actualites/insolite/"
        >
            Insolite
        </a>
    </h2>
    <ul>
                    

                    
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="abed45a68de63516a2874c6782f2d23e"
            data-target-legacy-id="5280357"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/abed45a68de63516a2874c6782f2d23e">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/insolite/2020-07-05/un-indien-porte-un-masque-en-or-pour-se-proteger-du-coronavirus.php" class="homeSectionHeadlinesCard__cover" title="Un Indien porte un masque en or pour se protéger du coronavirus">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/a7fd1f66-beb8-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/a7fd1f66-beb8-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/a7fd1f66-beb8-11ea-b33c-02fe89184577.jpg" alt=" Un Indien porte un masque en or pour se protéger du coronavirus)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/insolite/2020-07-05/un-indien-porte-un-masque-en-or-pour-se-proteger-du-coronavirus.php" title="Un Indien porte un masque en or pour se protéger du coronavirus"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/insolite/2020-07-05/un-indien-porte-un-masque-en-or-pour-se-proteger-du-coronavirus.php" title="Un Indien porte un masque en or pour se protéger du coronavirus">
                        Un Indien porte un masque en or pour se protéger du coronavirus
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié hier à 8h14</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-ACT
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="2de1b37e77653d71ac7d3df4a520fa7b"
            data-target-legacy-id="5280303"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/1/2de1b37e77653d71ac7d3df4a520fa7b">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/actualites/insolite/2020-07-04/concours-d-ingestion-de-hot-dogs-joey-chestnut-et-miki-sudo-champions.php" class="homeSectionHeadlinesCard__cover" title="Concours d&#039;ingestion de hot-dogs: Joey Chestnut et Miki Sudo champions">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/ed8463e1-be31-11ea-b33c-02fe89184577.jpg" alt=" Concours d&#039;ingestion de hot-dogs: Joey Chestnut et Miki Sudo champions)"/>
                                                    <span class="videoSticker">
    <span class='videoSticker__duration'>01:11</span>
</span>

                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-ACT"></div>
                <div class="sectionDash sectionDash--section-ACT"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/actualites/insolite/2020-07-04/concours-d-ingestion-de-hot-dogs-joey-chestnut-et-miki-sudo-champions.php" title="Concours d&#039;ingestion de hot-dogs: Joey Chestnut et Miki Sudo champions"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/actualites/insolite/2020-07-04/concours-d-ingestion-de-hot-dogs-joey-chestnut-et-miki-sudo-champions.php" title="Concours d&#039;ingestion de hot-dogs: Joey Chestnut et Miki Sudo champions">
                        Concours d'ingestion de hot-dogs: Joey Chestnut et Miki Sudo champions
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 4 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

            </div>

    <div class="homeRow homeRow--layout-column pageBlock--emplacement-homePageSectionHeadlines11">
        <div data-location="home-section">
                            
<div class="homeSectionHeadlines

            homeSectionHeadlines--itemPerRow-2
                            homeRow__column
                homeRow__column--col-2
                        homeSectionHeadlines--layout-column"
>
    <h2 class="
        subHeader
        subHeader__link
        subHeader--section-AFF"
    >
        <a data-target-type="section"
           href="https://www.lapresse.ca/affaires/tetes-daffiche/"
        >
            Têtes d&#039;affiche
        </a>
    </h2>
    <ul>
                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-1
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="d263afceb0f5382e93e7a59e1d1c9002"
            data-target-legacy-id="5280040"
            data-position="1"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/d263afceb0f5382e93e7a59e1d1c9002">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/bourses-pour-les-etudiants-athletes.php" class="homeSectionHeadlinesCard__cover" title="Bourses pour les étudiants-athlètes">
                                    <picture>
                        <source media="(max-width: 1023px)" srcset="https://mobile-img.lpcdn.ca/lpca/924x/r3996/8a430d99-bc7e-11ea-b33c-02fe89184577.jpg">
                        <source media="(min-width: 1024px)" srcset="https://mobile-img.lpcdn.ca/lpca/357x/r3996/8a430d99-bc7e-11ea-b33c-02fe89184577.jpg">
                        <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/8a430d99-bc7e-11ea-b33c-02fe89184577.jpg" alt=" Bourses pour les étudiants-athlètes)">
                    </picture>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/bourses-pour-les-etudiants-athletes.php" title="Bourses pour les étudiants-athlètes"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/bourses-pour-les-etudiants-athletes.php" title="Bourses pour les étudiants-athlètes">
                        Bourses pour les étudiants-athlètes
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 2 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

                    

                                
<li class="homeSectionHeadlines__item ">
    <article class="
                storyCard
                storyCard--position-2
                homeSectionHeadlinesCard
                 homeSectionHeadlinesCard--size-medium homeSectionHeadlinesCard--size-mobile-mini
                homeSectionHeadlinesCard--section-AFF
                homeSectionHeadlinesCard--displayMode-default
                            "
            data-target-type="story"
            data-target-id="c64e19dee77d38529c60f5c272900474"
            data-target-legacy-id="5280039"
            data-position="2"
    >
        <div class="webpart adminContainer"
             data-webpart-type="crayon"
             data-webpart-validate-crayon="true"
             data-webpart-url="/ops/webpart/crayon/article/4/c64e19dee77d38529c60f5c272900474">
        </div>
        <div class="homeSectionHeadlinesCard__inner">
            <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/pediatre-honore.php" class="homeSectionHeadlinesCard__cover" title="Pédiatre honoré">
                                    <img src="../mobile-img.lpcdn.ca/lpca/357x/r3996/a899d305/5777f5d8-bc7e-11ea-b33c-02fe89184577.jpg" alt=" Pédiatre honoré)"/>
                                            </a>
                        <div class="homeSectionHeadlinesCard__details">
                <div class="homeSectionHeadlinesCard__tag"></div>
                <div class="homeSectionHeadlinesCard__label homeSectionHeadlinesCard__label--section-AFF"></div>
                <div class="sectionDash sectionDash--section-AFF"></div>
                <span class="homeSectionHeadlinesCard__suptitle ">
                    <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/pediatre-honore.php" title="Pédiatre honoré"></a>
                </span>
                <h2 class="storyCard__title homeSectionHeadlinesCard__title ">
                    <a href="https://www.lapresse.ca/affaires/tetes-d-affiche/2020-07-02/pediatre-honore.php" title="Pédiatre honoré">
                        Pédiatre honoré
                    </a>
                </h2>
                                <p class="homeSectionHeadlinesCard__publicationDates">
                    
    <span>Publié le 2 juillet</span>

                </p>
            </div>
        </div>
    </article>
</li>

            </ul>
</div>

                    </div>
        <div class="homeContest">
            

    <section class="contestBox">
        <h2 class="subHeader subHeader--section-CONCOURS subHeader__link">
            <a href="https://www.lapresse.ca/concours/" target="_blank" rel="noopener">Concours</a>
        </h2>
        <div class="contestItem">
            <a href="http://pubads.g.doubleclick.net/gampad/clk?id=5399399504&amp;iu=/21686484267/LPCA/LPCA_actualites" target="_blank" rel="noopener" class="contestItem__link">
                <img src="../images.lpcdn.ca/435x290/202007/03/1750777.jpg" class="contestItem__visual" alt=""/>
                <p class="contestItem__description">À gagner : l'un des 5 forfaits vacances dans l'hôtel de votre choix du réseau <strong>Ôrigine artisans hôteliers</strong>!</p>
            </a>
        </div>
    </section>

        </div>
        <div class="homeContactUs pageBox">
            <section class="autoPromoBox">
    <h2 class="autoPromoBox__title">Nous joindre</h2>
    <p class="autoPromoBox__text">
        <a class="autoPromoBox__link" href="mailto:redaction@lapresse.ca?subject=Transmettez une nouvelle à la rédaction de La Presse">
            Transmettez une nouvelle à la rédaction de La Presse.
        </a>
    </p>
    <p class="autoPromoBox__text">
        <a class="autoPromoBox__link" href="mailto:direction_info@lapresse.ca?subject=Formulez un commentaire ou demandez une correction à la direction de l'information">
            Formulez un commentaire ou demandez une correction à la direction de l'information.
        </a>
    </p>
</section>

        </div>
    </div>

        <footer class="footer" data-location="footer">
    <div class="wrapper footer__wrapper">
        <div class="block footer__block footer__block--applications applications">
            <p>Nos applications</p>
            <ul>
                <li><a href="https://plus.lapresse.ca" title="La Presse+" target="_blank" rel="noopener">La Presse+</a></li>
                <li><a href="https://application.lapresse.ca" title="Application mobile La Presse" target="_blank" rel="noopener">Application mobile La&nbsp;Presse</a></li>
            </ul>
        </div>
        <div class="block footer__block footer__block--contact contact">
            <p>Contact</p>
            <ul>
                <li><a href="https://www.lapresse.ca/contact/">Nous joindre</a></li>
                <li><a href="https://www.lapresse.ca/a-propos-de-nous/la-presse/">À propos de nous</a></li>
                <li><a href="https://www.lapresse.ca/faq.php">Foire aux questions</a></li>
                <li><a href="https://carrieres.lapresse.ca/" target="_blank" rel="noopener">Faites carrière chez nous</a></li>
                <li><a href="https://publicite.lapresse.ca/" target="_blank" rel="noopener">Annoncez dans nos médias</a></li>
            </ul>
        </div>
        <div class="block footer__block footer__block--services services">
            <p>Services</p>
            <ul>
                <li><a href="http://necrologie.lapresse.ca/">Avis de décès</a></li>
                <li><a href="https://editions.lapresse.ca/">Les Éditions La Presse</a></li>
                <li><a href="https://www.lapresse.ca/meteo/ville/montreal_caqc0363.php">Météo</a></li>
                <li><a href="https://www.lapresse.ca/nosconcours/">Concours</a></li>
            </ul>
        </div>
        <div class="block footer__block footer__block--archives archives">
            <p>Archives</p>
            <ul>
                <li><a href="https://www.lapresse.ca/archives/">Recherche</a></li>
                <li><a href="https://www.lapresse.ca/archives_payantes/">Archives payantes</a></li>
            </ul>
        </div>
        <div class="block footer__block footer__block--social social">
            <p>Suivez-nous</p>
            <a class="facebook socials-facebook"
               href="https://fr-ca.facebook.com/LaPresseFB/"
               title="Suivre La Presse sur Facebook"
               target="_blank" rel="noopener" ></a>
            <a class="twitter socials-twitter"
               href="https://twitter.com/lp_lapresse"
               title="Suivre La Presse sur Twitter"
               target="_blank" rel="noopener" ></a>
            <a class="linkedin socials-linkedIn"
               href="https://www.linkedin.com/company/la-presse/"
               title="Suivre La Presse sur LinkedIn"
               target="_blank" rel="noopener" ></a>
            <a class="instagram socials-instagram"
               href="https://www.instagram.com/lp_lapresse/?hl=fr-ca"
               title="Suivre La Presse sur Instagram"
               target="_blank" rel="noopener" ></a>
            <a class="pinterest socials-pinterest"
               href="https://www.pinterest.com/lplapresse/"
               title="Suivre La Presse sur Pinterest"
               target="_blank" rel="noopener" ></a>
        </div>
        <div class="footer__block footer__block--legal">
            <p>Légal</p>
            <ul>
                <li><a href="https://www.lapresse.ca/conditions.php">Conditions d'utilisation</a></li>
                <li><a href="https://www.lapresse.ca/politique.php">Politique de confidentialité</a></li>
                <li><a href="https://publicite-electorale.lapresse.ca/" target="_blank" rel="noopener">Registre de publicité électorale</a></li>
                <li><a href="https://www.lapresse.ca/codedeconduite.pdf" target="_blank" rel="noopener">Code de conduite</a></li>
            </ul>
        </div>
    </div>

    <div class="wrapper footer__wrapper">
        <p class="copyright">© La Presse (2018) Inc. Tous droits réservés.</p>
        <p class="legal">
            <a href="https://www.lapresse.ca/conditions.php">Conditions d'utilisation</a><span class="legal">|</span>
            <a href="https://www.lapresse.ca/politique.php">Politique de confidentialité</a><span class="legal">|</span>
            <a href="https://publicite-electorale.lapresse.ca/" target="_blank" rel="noopener">Registre de publicité électorale</a><span class="legal">|</span>
            <a href="https://www.lapresse.ca/codedeconduite.pdf" target="_blank" rel="noopener">Code de conduite</a>
        </p>
        <div class="clear"></div>
    </div>
</footer>

        <!-- comscore -->
<script>document.write("<img id='img1' height='1' width='1'>");document.getElementById("img1").src="https://beacon.scorecardresearch.com/scripts/beacon.dll?C1=2&C2=3005690&C3=3005690&C4=lapresse.ca&C5=Lapresse&C6=&C7=" + escape(window.location.href) + "&C8=" + escape(document.title) + "&C9=" + escape(document.referrer) + "&rn=" + Math.floor(Math.random()*99999999);</script>
<!-- /comscore -->

<!-- Optable Authenticator markup start -->
<!-- You can customize this part, also have a look at css/optable-login.css -->
<!-- If you change any IDs in this part of the DOM, you may have to modify your call to window.optable.authenticator() -->
<div class="optable_login_modal optable-login-slide" id="optable-login" aria-hidden="true">
  <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
    <div class="optable_login_modal__container" role="dialog" aria-modal="true" aria-labelledby="optable-login-title">
      <header class="optable_login_modal__header">
        <h2 class="optable_login_modal__title">
          🔒 Identification Requested
        </h2>
        <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
      </header>
      <main class="optable_login_modal__content">
        <div>
          <p>Please login with your Email address or identity provider account to access free content.</p>
        </div>
        <div>
          <form class="black-80" id="optable-login-form" method="POST">
            <input name="email" required="required" type="email" class="input-reset ba b--black-20 pa2 mb2 db w-100 js-emailInput" placeholder="your.email@example.com" />
            <input id="optable-login-form-rurl" type="hidden" name="r" value="" />
            <input type="submit" class="optable_login_modal__btn optable_login_modal__btn-primary" value="Verify" />
          </form>
        </div>
        <div>
          <center><strong>or</strong></center>
        </div>
        <div>
          <button id="optable-login-button-google" class="optable_login_modal__btn optable_login_modal__btn-login-provider">
            <img src="/publishers/images/google.svg" width="25" /> Login with Google
          </button>
          <button id="optable-login-button-facebook" class="optable_login_modal__btn optable_login_modal__btn-login-provider">
            <img src="/publishers/images/facebook.svg" width="25" /> Login with Facebook
          </button>
        </div>
      </main>
    </div>
  </div>
</div>

<div class="optable_login_modal optable-login-slide" id="optable-login-email-sent" aria-hidden="true">
  <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
    <div class="optable_login_modal__container" role="dialog" aria-modal="true" aria-labelledby="optable-login-title">
      <header class="optable_login_modal__header">
        <h2 class="optable_login_modal__title">
          📧 Check your Email
        </h2>
        <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
      </header>
      <main class="optable_login_modal__content">
        <div>
          <p>We sent an Email to <strong><span data-optable-login-email></span></strong></p><br />
          <p>Please click on the link in the Email to login.</p>
        </div>
      </main>
    </div>
  </div>
</div>

<div class="optable_login_modal optable-login-slide" id="optable-login-email-error" aria-hidden="true">
  <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
    <div class="optable_login_modal__container" role="dialog" aria-modal="true" aria-labelledby="optable-login-title">
      <header class="optable_login_modal__header">
        <h2 class="optable_login_modal__title">
          ❗Connection Error
        </h2>
        <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
      </header>
      <main class="optable_login_modal__content">
        <div>
          <p>There was a problem processing your login.</p><br />
          <p><span data-optable-login-error></span></p><br />
          <p>Please try again.</p>
        </div>
      </main>
    </div>
  </div>
</div>
<!-- Optable Authenticator markup end -->

            <script type="text/javascript">window.NREUM||(NREUM={});NREUM.info={"beacon":"bam.nr-data.net","licenseKey":"b90eab036c","applicationID":"109615643","transactionName":"YVdbMBRSXkMEVhZcWFgdehEVR19dSlELRkdXRloMSVtfXQA=","queueTime":0,"applicationTime":392,"atts":"TRBYRlxITU0=","errorBeacon":"bam.nr-data.net","agent":""}</script></body>
</html>
