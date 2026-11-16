import { getBidMeta } from "./bid-meta";

describe("getBidMeta", () => {
  it("reads advertiser domains, deal and buyer fields", () => {
    const bid = {
      dealId: "PM-DEAL-1",
      meta: {
        advertiserDomains: ["Cure.com", "cure.com", "example.com"],
        networkId: 26492,
        networkName: "Some DSP",
        buyerId: "887",
        advertiserId: 12345,
      },
    };
    expect(getBidMeta(bid)).toEqual({
      adomain: ["cure.com", "example.com"],
      dealId: "PM-DEAL-1",
      networkId: "26492",
      networkName: "Some DSP",
      buyerId: "887",
      advertiserId: "12345",
    });
  });

  it("returns an empty object when the bid has no buyer fields", () => {
    expect(getBidMeta({ cpm: 1.2 })).toEqual({});
    expect(getBidMeta({ meta: {} })).toEqual({});
    expect(getBidMeta(undefined)).toEqual({});
  });

  it("drops empty and non-scalar values", () => {
    const bid = {
      dealId: "  ",
      meta: { advertiserDomains: ["", null, { a: 1 }], networkId: { id: 1 }, networkName: "", buyerId: null },
    };
    expect(getBidMeta(bid)).toEqual({});
  });

  it("keeps at most three domains and caps long values", () => {
    const bid = {
      dealId: "x".repeat(100),
      meta: { advertiserDomains: ["a.com", "b.com", "c.com", "d.com"] },
    };
    const meta = getBidMeta(bid);
    expect(meta.adomain).toEqual(["a.com", "b.com", "c.com"]);
    expect(meta.dealId).toHaveLength(64);
  });
});
