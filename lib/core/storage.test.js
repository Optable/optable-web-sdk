import LocalStorage from './storage'
import crypto from "crypto";

function randomConfig() {
  const randomHex = crypto.randomBytes(8).toString("hex");
  return { host: `host-${randomHex}`, site: `site-${randomHex}`}
}

describe("LocalStorage", () => {
  test("allows to store and retrieve a passport", () => {
    const store = new LocalStorage(randomConfig())
    expect(store.getPassport()).toBeNull()
    store.setPassport("abc")
    expect(store.getPassport()).toEqual("abc")
    store.clearPassport()
    expect(store.getPassport()).toBeNull()
  })

  test("allows to store and retrieve targeting", () => {
    const store = new LocalStorage(randomConfig())
    expect(store.getTargeting()).toBeNull()
    store.setTargeting({ user: [], audience: [] })
    expect(store.getTargeting()).toEqual({ user: [], audience: [] })
    store.clearPassport()
    expect(store.getPassport()).toBeNull()
  })

  test("auto fixes v1 targeting as v2 base on audience key presence", () => {
    const store = new LocalStorage(randomConfig())
    window.localStorage.setItem(store.targetingV1Key, JSON.stringify({ k1: ["v1"], k2: ["v2"] }))

    expect(store.getTargeting()).toEqual({
      user: [],
      audience: [
        { provider: "optable.co", keyspace: "k1", ids: [{id: "v1"}], rtb_segtax: 5001},
        { provider: "optable.co", keyspace: "k2", ids: [{id: "v2"}], rtb_segtax: 5001},
      ]
    })

    store.setTargeting({ audience: [] })
    expect(store.getTargeting()).toEqual({
      audience: []
    })
  })

  test("setLoblawMediaPrivateID doesn't store anything if disabled", () => {
    const store = new LocalStorage(randomConfig())
    store.setLoblawMediaPrivateID({ user: [], audience: [] })
    expect(store.getLoblawMediaPrivateID()).toBeNull()
  })

  test("setLoblawMediaPrivateID store first private id if enabled", () => {
    const store = new LocalStorage(randomConfig())
    store.setLoblawMediaPrivateID({ user: [{provider: "loblawmedia.ca", ids: [{id: "PIDV1first"}, {id: "PIDV1second"}]}] })
    expect(store.getLoblawMediaPrivateID()).toBe("PIDV1first")
  })
})
