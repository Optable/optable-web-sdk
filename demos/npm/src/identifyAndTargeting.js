import OptableSDK from "@optable/web-sdk";

const sdk = new OptableSDK({
  // host of the MCI Edge service.
  host: "ca.edge.optable.co",
  // node ID of the DCN.
  node: "optable",
  // legacy host cache of the DCN (for backwards compatibility).
  legacyHostCache: "sandbox.optable.co",
  // slug of the site created in the DCN. Make sure the site source you created allows traffic from the
  // domain you are going to serve this JS (tip: for test purposes ONLY, use `.*` as the regular expression
  // for the allowed HTTP origins).
  site: "any-site",
  // For demo purposes, and since this JS is most-likely not going to be served by an eTLD+1 domain from
  // your DCN, cookies are set to false (localStorage will be used instead).
  // See https://github.com/Optable/optable-web-sdk#domains-and-cookies for more info.
  cookies: false
});


// The Identify API calls your DCN to register the given identifier(s) and append them to your DCN's
// identity graph.
// See https://github.com/Optable/optable-web-sdk#identify-api for more info.
const emailID = OptableSDK.eid("some.email@address.com");
const ppid = OptableSDK.cid("some.publisher.provided.identifier");
sdk.identify(emailID, ppid)
  .then(() => console.log("Identify API success!"))
  .catch((err) => console.warn(`Identify API error: ${err}`));


// The Targeting API calls your DCN to retrieve the list of activated audiences configured in your DCN
// that include one of the identifier(s). If the list is empty, it means there are no audiences in your
// DCN that are activated AND include one (or more) of the current user's registered identifiers.
// See https://github.com/Optable/optable-web-sdk#targeting-api for more info.
sdk
  .targetingKeyValues()
  .then((keyvalues) => {
    for (const [key, values] of Object.entries(keyvalues)) {
      console.log(`Targeting KV: ${key} = ${values.join(",")}`);
    }
  })
  .catch((err) => console.warn(`Targeting API Error: ${err}`));
