import { setStaticMappings } from "./staticMappings";

const w = window as unknown as { optable?: any };

beforeEach(() => {
  delete w.optable;
});

describe("setStaticMappings", () => {
  it("creates w.optable and fills top-level and nested defaults", () => {
    setStaticMappings({
      site: "customer-sdk",
      analytics: { tenant: "customer", sample: 0.1 },
    });
    expect(w.optable.site).toBe("customer-sdk");
    expect(w.optable.analytics).toEqual({ tenant: "customer", sample: 0.1 });
  });

  it("leaves publisher-set values alone, including falsy ones", () => {
    w.optable = {
      site: "publisher-site",
      withID5: false,
      analytics: { sample: 0, tenant: "" },
    };
    setStaticMappings({
      site: "customer-sdk",
      withID5: true,
      analytics: { sample: 0.1, tenant: "customer", pbjsObjectName: "pbjs" },
    });
    expect(w.optable.site).toBe("publisher-site");
    expect(w.optable.withID5).toBe(false);
    expect(w.optable.analytics.sample).toBe(0);
    expect(w.optable.analytics.tenant).toBe("");
    expect(w.optable.analytics.pbjsObjectName).toBe("pbjs");
  });

  it("replaces null values with defaults", () => {
    w.optable = { node: null };
    setStaticMappings({ node: "a" });
    expect(w.optable.node).toBe("a");
  });

  it("treats arrays as leaves and assigns absent object defaults by reference", () => {
    const pbjs = { que: [] };
    w.optable = { prebidInstances: ["oajs"] };
    setStaticMappings({
      prebidInstances: ["pbjs"],
      analytics: { pbjsObject: pbjs },
    });
    expect(w.optable.prebidInstances).toEqual(["oajs"]);
    expect(w.optable.analytics.pbjsObject).toBe(pbjs);
  });

  it("does not recurse into a publisher value that is not a plain object", () => {
    w.optable = { analytics: "off" };
    setStaticMappings({ analytics: { tenant: "customer" } });
    expect(w.optable.analytics).toBe("off");
  });

  it("replaces a non-object window.optable instead of throwing", () => {
    w.optable = "clobbered";
    setStaticMappings({ site: "customer-sdk" });
    expect(w.optable).toEqual({ site: "customer-sdk" });
  });
});
