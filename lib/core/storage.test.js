import { DCN_DEFAULTS } from "../config";
import crypto from "crypto";
import LocalStorage from "./storage";

function randomConfig() {
  const randomHex = crypto.randomBytes(8).toString("hex");
  return {
    host: `host-${randomHex}`,
    site: `site-${randomHex}`,
    consent: DCN_DEFAULTS.consent,
  };
}

describe("LocalStorage", () => {
  test("allows to store and retrieve a passport", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getPassport()).toBeNull();
    store.setPassport("abc");
    expect(store.getPassport()).toEqual("abc");
    store.clearPassport();
    expect(store.getPassport()).toBeNull();
  });

  describe("getVisitorId", () => {
    const jwt = (payload) => "header." + btoa(JSON.stringify(payload)) + ".sig";

    test("returns null when no passport is stored", () => {
      const store = new LocalStorage(randomConfig());
      expect(store.getVisitorId()).toBeNull();
    });

    test("extracts id claim from the passport JWT payload", () => {
      const store = new LocalStorage(randomConfig());
      store.setPassport(jwt({ id: "vid-abc", other: "ignored" }));
      expect(store.getVisitorId()).toEqual("vid-abc");
    });

    test("returns null when passport has no id claim", () => {
      const store = new LocalStorage(randomConfig());
      store.setPassport(jwt({ sub: "no-id-here" }));
      expect(store.getVisitorId()).toBeNull();
    });

    test("returns null when passport is not a well-formed JWT", () => {
      const store = new LocalStorage(randomConfig());
      store.setPassport("not-a-jwt");
      expect(store.getVisitorId()).toBeNull();
    });

    test("returns null when passport payload is not valid base64 JSON", () => {
      const store = new LocalStorage(randomConfig());
      store.setPassport("header.!!!not-base64!!!.sig");
      expect(store.getVisitorId()).toBeNull();
    });

    test("decodes base64url-encoded payloads (with - and _ characters)", () => {
      const store = new LocalStorage(randomConfig());
      // Hand-crafted payload that produces base64url-specific characters.
      const payload = { id: "a?b>c<d" };
      const base64url = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      store.setPassport(`header.${base64url}.sig`);
      expect(store.getVisitorId()).toEqual("a?b>c<d");
    });
  });

  test("setTargeting writes a :ts sibling with the write time and clearTargeting removes it", () => {
    const store = new LocalStorage(randomConfig());
    const tsKeys = () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k.endsWith(":ts")) keys.push(k);
      }
      return keys;
    };
    localStorage.clear();
    const before = Date.now();
    store.setTargeting({ user: [], audience: [] });
    const keys = tsKeys();
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach((k) => {
      expect(Number(localStorage.getItem(k))).toBeGreaterThanOrEqual(before);
      expect(localStorage.getItem(k.slice(0, -3))).not.toBeNull();
    });
    store.clearTargeting();
    expect(tsKeys()).toEqual([]);
  });

  test("setTargeting normalizes wire refs into the source-keyed sidecar", () => {
    const store = new LocalStorage(randomConfig());
    const ref = {
      advertising_token: "adv",
      refresh_token: "rt",
      refresh_response_key: "rk",
      refresh_from: 1,
      refresh_expires: 2,
      identity_expires: 3,
    };
    store.setTargeting({
      ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "x", ext: { optable: { ref: "0" } } }] }] } },
      refs: { 0: ref },
    });

    const cached = store.getTargeting();
    expect(cached.refs).toEqual({ "uidapi.com": ref });
    expect(cached.ortb2.user.eids[0].uids[0].ext).toBeUndefined();
  });

  test("setTargeting carries over EIDs for sources the new response omits", () => {
    const store = new LocalStorage(randomConfig());
    const eid = (source, id) => ({ source, uids: [{ id }] });

    store.setTargeting({ ortb2: { user: { eids: [eid("uidapi.com", "u1")] } } });
    store.setTargeting({ ortb2: { user: { eids: [eid("liveramp.com", "l1")] } } });

    const sources = store
      .getTargeting()
      .ortb2.user.eids.map((e) => e.source)
      .sort();
    expect(sources).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("setTargeting keeps the rest of the response when it carries EIDs over", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting({
      audience: [{ provider: "optable.co", ids: [{ id: "seg" }], rtb_segtax: 5001 }],
      ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } },
    });

    const cached = store.getTargeting();
    expect(cached.audience).toEqual([{ provider: "optable.co", ids: [{ id: "seg" }], rtb_segtax: 5001 }]);
    expect(cached.ortb2.user.eids).toHaveLength(2);
  });

  test("setTargeting drops a source the new response revokes with no uids", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting({
      ortb2: {
        user: {
          eids: [
            { source: "uidapi.com", uids: [] },
            { source: "liveramp.com", uids: [{ id: "l1" }] },
          ],
        },
      },
    });

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["liveramp.com"]);
  });

  test("setTargeting keeps the UID2 ref for a source the new response omits", () => {
    const store = new LocalStorage(randomConfig());
    const ref = {
      advertising_token: "adv",
      refresh_token: "rt",
      refresh_response_key: "rk",
      refresh_from: 1,
      refresh_expires: 2,
      identity_expires: 3,
    };

    store.setTargeting({
      ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1", ext: { optable: { ref: "0" } } }] }] } },
      refs: { 0: ref },
    });
    store.setTargeting({ ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } } });

    expect(store.getTargeting().refs).toEqual({ "uidapi.com": ref });
  });

  test("setTargeting stores every UID on a source rather than capping at two", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({
      ortb2: { user: { eids: [{ source: "pair-protocol.com", uids: [{ id: "a" }, { id: "b" }, { id: "c" }] }] } },
    });

    expect(store.getTargeting().ortb2.user.eids[0].uids).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
  });

  test("setTargeting overwrites a cache that does not parse", () => {
    const store = new LocalStorage(randomConfig());
    store.writeToStorageKeys(store.targetingKeys, "{not json");

    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });

    expect(store.getTargeting().ortb2.user.eids).toEqual([{ source: "uidapi.com", uids: [{ id: "u1" }] }]);
  });

  test("setTargeting carries EIDs over to a response that lists none", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting({
      audience: [{ provider: "optable.co", ids: [{ id: "s" }], rtb_segtax: 1 }],
      ortb2: { user: {} },
    });

    const cached = store.getTargeting();
    expect(cached.ortb2.user.eids.map((e) => e.source)).toEqual(["uidapi.com"]);
    expect(cached.audience).toHaveLength(1);
  });

  test("setTargeting leaves no EID behind when the response revokes every source", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [] }] } } });

    expect(store.getTargeting().ortb2.user.eids).toEqual([]);
  });

  test("setTargeting replaces the cache when the caller opts out of merging", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting(
      { ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } } },
      { merge: false }
    );

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["liveramp.com"]);
  });

  test("setTargeting drops a revoked source when it replaces rather than merges", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });
    store.setTargeting(
      {
        ortb2: {
          user: {
            eids: [
              { source: "uidapi.com", uids: [] },
              { source: "id5-sync.com", uids: [{ id: "i1" }] },
            ],
          },
        },
      },
      { merge: false }
    );

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["id5-sync.com"]);
  });

  test("setTargeting replaces rather than merges when the visitor id changed", () => {
    const store = new LocalStorage(randomConfig());
    const passportFor = (id) => "header." + btoa(JSON.stringify({ id })) + ".sig";

    store.setPassport(passportFor("visitor-a"));
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });

    store.setPassport(passportFor("visitor-b"));
    store.setTargeting({ ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } } });

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["liveramp.com"]);
  });

  test("setTargeting replaces rather than merges when the request ids changed", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("uidapi.com", "u1"), { requestIds: ["e:user-a"] });
    store.setTargeting(eids("liveramp.com", "l1"), { requestIds: ["e:user-b"] });

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["liveramp.com"]);
  });

  test("setTargeting merges when the request drops an id it sent before", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("uidapi.com", "u1"), { requestIds: ["__passport__", "e:user-a"] });
    store.setTargeting(eids("liveramp.com", "l1"), { requestIds: ["__passport__"] });

    expect(
      store
        .getTargeting()
        .ortb2.user.eids.map((e) => e.source)
        .sort()
    ).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("setTargeting merges when the request adds an id", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("uidapi.com", "u1"), { requestIds: ["__passport__"] });
    store.setTargeting(eids("liveramp.com", "l1"), { requestIds: ["__passport__", "e:user-a"] });

    expect(
      store
        .getTargeting()
        .ortb2.user.eids.map((e) => e.source)
        .sort()
    ).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("setTargeting does not carry one user's EIDs across a sign-out to the next", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("a-only.com", "a1"), { requestIds: ["__passport__", "e:user-a"] });
    store.setTargeting(eids("shared.com", "s1"), { requestIds: ["__passport__"] });
    store.setTargeting(eids("b-only.com", "b1"), { requestIds: ["__passport__", "e:user-b"] });

    expect(store.getTargeting().ortb2.user.eids.map((e) => e.source)).toEqual(["b-only.com"]);
  });

  // What sdk.targeting() and sdk.targeting("e:x") actually send: the default
  // request carries __passport__ alone and the string form carries the id
  // alone, so the two sets are disjoint unless __passport__ is excluded.
  test("setTargeting merges across the request ids the SDK builds for a sign-in", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("liveramp.com", "l1"), { requestIds: ["__passport__"] });
    store.setTargeting(eids("uidapi.com", "u1"), { requestIds: ["e:user-a"] });

    expect(
      store
        .getTargeting()
        .ortb2.user.eids.map((e) => e.source)
        .sort()
    ).toEqual(["liveramp.com", "uidapi.com"]);
  });

  // identifyAndTokenize writes to the public key alone, so a source it added
  // is only visible there.
  test("setTargeting keeps a source another writer added to the public copy", () => {
    const store = new LocalStorage({ ...randomConfig(), optableCacheTargeting: "OPTABLE_RESOLVED" });
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("first.com", "f1"), { requestIds: ["__passport__"] });
    const pub = JSON.parse(localStorage.getItem("OPTABLE_RESOLVED"));
    pub.ortb2.user.eids.push({ source: "tokenize.com", uids: [{ id: "t1" }] });
    localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify(pub));

    store.setTargeting(eids("second.com", "s1"), { requestIds: ["__passport__"] });

    expect(
      store
        .getTargeting()
        .ortb2.user.eids.map((e) => e.source)
        .sort()
    ).toEqual(["first.com", "second.com", "tokenize.com"]);
  });

  test("setTargeting still merges when the identity is unchanged", () => {
    const store = new LocalStorage(randomConfig());
    const eids = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });

    store.setTargeting(eids("uidapi.com", "u1"), { requestIds: ["e:user-a"] });
    store.setTargeting(eids("liveramp.com", "l1"), { requestIds: ["e:user-a"] });

    expect(
      store
        .getTargeting()
        .ortb2.user.eids.map((e) => e.source)
        .sort()
    ).toEqual(["liveramp.com", "uidapi.com"]);
  });

  // A response already in cache format keeps its refs verbatim through
  // replaceCache, so a non-UID2 ref can reach the cache and must survive a merge.
  test("setTargeting keeps a non-UID2 ref for a source the new response omits", () => {
    const store = new LocalStorage(randomConfig());
    const ref = { some: "opaque-ref-payload" };

    store.setTargeting({
      ortb2: { user: { eids: [{ source: "example.com", uids: [{ id: "x" }] }] } },
      refs: { "example.com": ref },
    });
    store.setTargeting({ ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } } });

    expect(store.getTargeting().refs).toEqual({ "example.com": ref });
  });

  test("setTargeting drops a stale ref when the response re-sends the source without one", () => {
    const store = new LocalStorage(randomConfig());

    store.setTargeting({
      ortb2: { user: { eids: [{ source: "example.com", uids: [{ id: "x" }] }] } },
      refs: { "example.com": { some: "opaque-ref-payload" } },
    });
    store.setTargeting({ ortb2: { user: { eids: [{ source: "example.com", uids: [{ id: "y" }] }] } } });

    expect(store.getTargeting().refs).toEqual({});
  });

  test("setTargeting returns what it stored", () => {
    const store = new LocalStorage(randomConfig());
    store.setTargeting({ ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "u1" }] }] } } });

    const stored = store.setTargeting({
      ortb2: { user: { eids: [{ source: "liveramp.com", uids: [{ id: "l1" }] }] } },
    });

    expect(stored.ortb2.user.eids.map((e) => e.source).sort()).toEqual(["liveramp.com", "uidapi.com"]);
    expect(stored).toEqual(store.getTargeting());
  });

  test("allows to store and retrieve targeting", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getTargeting()).toBeNull();
    store.setTargeting({ user: [], audience: [] });
    expect(store.getTargeting()).toEqual({ user: [], audience: [], refs: {} });
    store.clearTargeting();
    expect(store.getTargeting()).toBeNull();
  });

  test("targeting also writes to public key", () => {
    const store = new LocalStorage({ ...randomConfig(), optableCacheTargeting: "my_public_key" });
    expect(store.storage.getItem("my_public_key")).toBeNull();
    store.setTargeting({ ortb2: { prop1: "some-value" } });
    expect(store.storage.getItem("my_public_key")).toEqual(
      JSON.stringify({ ortb2: { prop1: "some-value" }, refs: {} })
    );
  });

  test("allows to set targeting with empty value", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.setTargeting());
    expect(store.getTargeting()).toBeNull();
  });

  test("allows to store and retrieve a site config", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getSite()).toBeNull();
    const config = {};
    store.setSite(config);
    expect(store.getSite()).toEqual(config);
    store.clearSite();
    expect(store.getSite()).toBeNull();
  });

  test("allows to set site with empty value", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.setSite());
    expect(store.getSite()).toBeNull();
  });

  test("persists pair ids from targeting responses", () => {
    const store = new LocalStorage(randomConfig());
    expect(
      store.setTargeting({
        ortb2: {
          user: {
            eids: [
              { source: "pair-protocol.com", uids: [{ id: "pair1" }] },
              { source: "pair-protocol.com", uids: [{ id: "pair1" }, { id: "pair2" }] },
              { source: "unrelated.test", uids: [{ id: "pair3" }] },
            ],
          },
        },
      })
    );
    expect(store.storage.getItem("_optable_pairId")).toBe(btoa(JSON.stringify({ envelope: ["pair1", "pair2"] })));
    expect(store.getPairIDs()).toEqual(["pair1", "pair2"]);
  });

  test("persists the ID5 signature from targeting responses", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getID5Signature()).toBeNull();

    store.setTargeting({
      ortb2: {
        user: {
          eids: [
            { source: "unrelated.test", uids: [{ id: "x", ext: { optable: { ref: "0" } } }] },
            { source: "id5-sync.com", uids: [{ id: "ID5*abc", ext: { optable: { ref: "1" } } }] },
          ],
        },
      },
      refs: { 0: { signature: "not-id5" }, 1: { signature: "ID5_sig" } },
    });
    expect(store.getID5Signature()).toBe("ID5_sig");

    store.setTargeting({ ortb2: { user: { eids: [{ source: "id5-sync.com", uids: [{ id: "ID5*abc" }] }] } } });
    expect(store.getID5Signature()).toBe("ID5_sig");

    store.clearTargeting();
    expect(store.getID5Signature()).toBeNull();
  });
});
