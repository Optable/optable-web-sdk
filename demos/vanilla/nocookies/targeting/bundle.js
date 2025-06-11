function initializeOptable() {
  window.optable = window.optable || { cmd: [] };

  optable.cmd.push(function () {
    optable.instance_auth = new optable.SDK({
      host: "sandbox.optable.co",
      initPassport: true,
      site: "web-sdk-demo",
      cookies: false,
      node: "",
      legacyHostCache: "",
    });

    optable.instance_td = new optable.SDK({
        host: 'na.edge.optable.co',
        node: 'freestar',
        legacyHostCache: 'freestar.cloud.optable.co',
        site: "prod-fallback-default-site",
        initPassport: false,
        cookies: false,
    });

    optable.instance_id5 = new optable.SDK({
        host: 'na.edge.optable.co',
        node: 'freestar-id5',
        legacyHostCache: 'freestar.cloud.optable.co',
        site: "prod-fallback-default-site",
        initPassport: false,
        cookies: false,
    });


    function callResolve() {
        const eidSources = new Set();
        window.optable.tokensArr = [];
        window.optable.eid_obj = {
          ortb2: {
            user: {
              data: [],
              eids: [],
            },
          },
        };
      
        // Helper function to dispatch an event when localStorage is updated
    function dispatch() {
        localStorage.OPTABLE_RESOLVED = JSON.stringify(window.optable.eid_obj);
        document.dispatchEvent(new CustomEvent('optableResolved', {
        detail: {
            resolved: !!window.optable.tokensArr.length,
        },
        }));
        }
      
        // Helper function writing to localStorage
        function updateEidsObj() {
          if (window.optable.tokensArr.length) {
            // e.g. { 'freestar.com': 1, 'truedata.co': 1, 'retention.com': 3 }
            if (window.optable.eidPriorities) {
              let prioritizedInt = Infinity;
              let finalArray = [];
              window.optable.tokensArr.forEach((token) => {
                const prioInt = window.optable.eidPriorities[token.matcher];
                if (prioInt < prioritizedInt) {
                  prioritizedInt = prioInt;
                  finalArray = [];
                }
                if (prioInt === prioritizedInt) {
                  finalArray.push(token);
                }
              });
              window.optable.tokensArr = [...finalArray];
            }
            // Order eids in order of importance for SSP/DSP who only consider the first one
            const matcherOrder = ['freestar.com', 'truedata.co', 'id5.io'];
            window.optable.tokensArr.sort((a, b) => {
              const indexA = matcherOrder.indexOf(a.matcher);
              const indexB = matcherOrder.indexOf(b.matcher);
              const rankA = indexA === -1 ? Infinity : indexA;
              const rankB = indexB === -1 ? Infinity : indexB;
              return rankA - rankB;
            });
      
            window.optable.eid_obj.ortb2.user.eids = [...window.optable.tokensArr];
          }
        }
      
        // Helper function to process tokens and build OPTABLE_RESOLVED object
        function processTokens(tokens, matcher, mm) {
          if (tokens) {
            eidSources.add(matcher); // Add matcher only if a token has been returned
            tokens.forEach((token) => {
              const uid2 = 'uidapi.com';
              const uids = token.source === uid2
                ? (token.uids || []).map((uid) => {
                  const { ext, ...rest } = uid; // Destructure and exclude the 'ext' key
                  return rest; // Return the object without 'ext'
                })
                : [...(token.uids || [])];
              const eid = {
                inserter: 'optable.co',
                matcher,
                mm,
                source: token.source,
                uids,
              };
              window.optable.tokensArr.push(eid);
            });
          }
        }
      
    function resolveAndProcessId5() {
          const eidTemplate = {
            inserter: 'optable.co',
            matcher: 'id5.io',
            mm: 5,
          };
          const mapped = {
            c: { ...eidTemplate, source: 'adnxs.com', uids: [] },
            c1: { ...eidTemplate, source: 'criteo.com', uids: [] },
            c2: { ...eidTemplate, source: 'gumgum.com', uids: [] },
            c3: { ...eidTemplate, source: 'indexexchange.com', uids: [] },
            c4: { ...eidTemplate, source: 'inmobi.com', uids: [] },
            c5: { ...eidTemplate, source: 'openx.com', uids: [] },
            c6: { ...eidTemplate, source: 'pubmatic.com', uids: [] },
            c7: { ...eidTemplate, source: 'magnite.com', uids: [] },
            c8: { ...eidTemplate, source: 'sovrn.com', uids: [] },
            c9: { ...eidTemplate, source: 'adsrvr.org', uids: [] },
            c10: { ...eidTemplate, source: 'triplelift.com', uids: [] },
            c11: { ...eidTemplate, source: 'unrulymedia.com', uids: [] },
            c12: { ...eidTemplate, source: 'yieldmo.com', uids: [] },
          };
      
        return window.optable.instance_id5.targeting(window.optable.id5Id).then((response) => {
            const id5Uids = response?.ortb2?.user?.eids?.[0]?.uids;
            if (!id5Uids?.length) return;
            id5Uids.forEach((uid) => {
              if (!uid.id) return;
              const [prefix, id] = uid.id.split(':');
              mapped[prefix]?.uids?.push({ id, atype: 1 });
            });
            Object.values(mapped).forEach((entry) => {
              if (entry.uids.length) {
                const clonedEntry = { ...entry };
                clonedEntry.uids = [entry.uids[0]];
                window.optable.tokensArr.push(clonedEntry);
              }
            });
          });
        }
      
        function getId5Promise() {
          return new Promise((resolve) => {
              window.optable.id5Id = 'id5:ID5-QA';
              resolveAndProcessId5().then(resolve);
          });
        }
      
        Promise.allSettled([
          window.optable.instance_auth.targeting().then((response) => {
            const segmentData = response.ortb2.user.data;
            const tokens = response.ortb2.user.eids;
            segmentData?.forEach((entry) => {
              if (entry?.segment?.length) {
                window.optable.eid_obj.ortb2.user.data.push(entry);
              }
            });
            processTokens(tokens, 'sandbox.com', 3);
          }),
          window.optable.instance_td.targeting('i4:1.2.3.4').then((response) => {
            const tokens = response.ortb2.user.eids;
            processTokens(tokens, 'truedata.co', 5);
          }),
          getId5Promise(),
        ]).then(() => {
          updateEidsObj();
          window.optable.eidSources = new Set(eidSources);
          dispatch();
        });
      }

      callResolve(); // Call the function to execute the logic

      const defaultHandleRtd = async (reqBidsConfigObj, optableExtraData, mergeFn) => {
        console.log('Entering custom handler');

        // Get targeting data from cache, if available
        let targetingData = JSON.parse(localStorage.OPTABLE_RESOLVED);
        // If no targeting data is found in the cache, call the targeting function

  
        if (!targetingData || !targetingData.ortb2) {
          console.log('No targeting data found');
          return;
        }
      
        const FILTER_FROM_GLOBAL_ORTB2_MAPPING = [
          {
            // matcher to NOT include to the global ORTB2 object
            matcher: "id5.io",
            // "source" to "bidder code" mapping to route EIDs to respective bidder adapters
            siteToBidAdapter: {
                "triplelift.com": "triplelift", // triplelift.com's bider code (from respective bidder adapter, tripleliftBidAdapter.js)
                "indexexchange.com": "ix", // same for indexexchange.com, ixBidAdapter.js
                "pubmatic.com": "pubmatic", // routing fake sources to pubmaticBidAdapter.js
            },
          },
        ];

        console.log('Targeting data with EIDs: ', JSON.parse(JSON.stringify(targetingData.ortb2)));
      
        /*
         * Filter the EIDs based on the mock matcher filtering configuration
         */
      
        // preserve the original EIDs
      
        const originalEids = targetingData.ortb2.user.eids.slice();
       
        // global EIDs
        targetingData.ortb2.user.eids = targetingData.ortb2.user.eids.filter(eid =>
          !FILTER_FROM_GLOBAL_ORTB2_MAPPING.some(mapping => mapping.matcher === eid.matcher)
        );
      
        console.log('EIDs to be kept for global ORTB2 enrichment: ', targetingData.ortb2.user.eids);
      
        // enrich per-bidder EIDs using filtered data
        const perBidderEids = {};
        originalEids.forEach(eid => {
          const mapping =
            FILTER_FROM_GLOBAL_ORTB2_MAPPING.find(mapping => mapping.matcher === eid.matcher);
          if (mapping && Object.keys(mapping.siteToBidAdapter).includes(eid.source)) {
            const bidderCode = mapping.siteToBidAdapter[eid.source];
            perBidderEids[bidderCode] = perBidderEids[bidderCode] || { user: { eids: [] } };
            perBidderEids[bidderCode].user.eids.push(eid);
          }
        });
      
        console.log('Per-bidder EIDs to be enriched: ', perBidderEids);
      
  
        // merge the per-bidder EIDs into the `reqBidsConfigObj.ortb2Fragments.bidder` object
        mergeFn(
          reqBidsConfigObj.ortb2Fragments.bidder,
          perBidderEids
        );
      
        // merge global ORTB2 data into the `reqBidsConfigObj.ortb2Fragments.global` object
        mergeFn(
          reqBidsConfigObj.ortb2Fragments.global,
          targetingData.ortb2
        );
      };



    // Create a ref for RTD module to use SDK.
    optable.rtd = optable.rtd || {};
    optable.rtd.handleRTD = defaultHandleRtd;

    // A default instance namespace is required for the rtd module because if not if fails. Going forward this should be exposed in the rtd namespace
    //https://github.com/Optable/Prebid.js/blob/ce307b808b0466e9a473c43988b8f404bce8394c/modules/optableRtdProvider.js#L150
    optable.instance = optable.instance_auth;


  });

}

function configureOptableForPrebid() {
  optable.cmd.push(function () {
    pbjs.mergeConfig({
      realTimeData: {
        auctionDelay: 40,
        dataProviders: [
          {
            name: 'optable',
            params: {
                handleRtd: optable.rtd.handleRTD,
            }
          },
        ],
      },
    });
  });
}

// Call the function to initialize Optable
initializeOptable();

// Call the function to configure Optable for Prebid
configureOptableForPrebid();

