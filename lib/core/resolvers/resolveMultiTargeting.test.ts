import { resolveMultiNodeTargeting, TargetingResponse } from "./resolveMultiTargeting.ts";
import { IDMatchMethod } from "iab-adcom";

const createTargetingResponse = ({
  data = [],
  eids = [],
  refs = undefined,
  resolved_ids = [],
}: {
  data?: any;
  eids?: any;
  refs?: any;
  resolved_ids?: any;
}) => {
  return {
    refs,
    resolved_ids,
    ortb2: {
      user: {
        data,
        eids,
      },
    },
  };
};

describe("resolveMultiNodeTargeting", () => {
  test("properly aggregates all eids with sources", async () => {
    const matcherOneMMThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          data: [
            { id: "data1", name: "Provider1" },
            { id: "data2", name: "Provider2" },
          ],
          eids: [
            { inserter: "optable.co", source: "uid2.com", uids: [{ id: "uid123" }, { id: "uid456" }] },
            { inserter: "optable.co", source: "criteo.com", uids: [{ id: "uid123" }, { id: "uid456" }] },
          ],
        })
      );
    });

    const matcherTwoMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          data: [],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }],
        })
      );
    });

    const matcherThreeMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          eids: [{ inserter: "optable.co", source: "another-place.com", uids: [{ id: "some-id" }] }],
        })
      );
    });

    const configs = [
      { targetingFn: () => matcherOneMMThree, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED },
      { targetingFn: () => matcherTwoMMFive, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE },
      { targetingFn: () => matcherThreeMMFive, matcher: "matcher_three", mm: IDMatchMethod.INFERENCE },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.data).toEqual([
      { id: "data1", name: "Provider1" },
      { id: "data2", name: "Provider2" },
    ]);
    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "uid2.com",
        uids: [{ id: "uid123" }, { id: "uid456" }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "criteo.com",
        uids: [{ id: "uid123" }, { id: "uid456" }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_two",
        mm: IDMatchMethod.INFERENCE,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_three",
        mm: IDMatchMethod.INFERENCE,
        source: "another-place.com",
        uids: [{ id: "some-id" }],
      },
    ]);

    expect(eidSources).toEqual(new Set<string>(["matcher_one", "matcher_two", "matcher_three"]));
  });

  test("resolves empty responses gracefully for aggregate resolving", async () => {
    const emptyTargetingOne = new Promise<TargetingResponse>((resolve) => resolve(createTargetingResponse({})));
    const emptyTargetingTwo = new Promise<TargetingResponse>((resolve) => resolve(createTargetingResponse({})));

    const configs = [
      { targetingFn: () => emptyTargetingOne, matcher: "matcher_one", mm: IDMatchMethod.COOKIE_SYNC },
      { targetingFn: () => emptyTargetingTwo, matcher: "matcher_two", mm: IDMatchMethod.COOKIE_SYNC },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(eidSources).toEqual(new Set<string>([]));
    expect(ortb2).toEqual({ user: { data: [], eids: [] } });
  });

  test("resolves empty responses gracefully for priority resolving", async () => {
    const emptyTargetingOne = new Promise<TargetingResponse>((resolve) => resolve(createTargetingResponse({})));
    const emptyTargetingTwo = new Promise<TargetingResponse>((resolve) => resolve(createTargetingResponse({})));

    const configs = [
      { targetingFn: () => emptyTargetingOne, matcher: "matcher_one", mm: IDMatchMethod.COOKIE_SYNC, priority: 1 },
      { targetingFn: () => emptyTargetingTwo, matcher: "matcher_two", mm: IDMatchMethod.COOKIE_SYNC, priority: 2 },
    ];
    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(eidSources).toEqual(new Set<string>([]));
    expect(ortb2).toEqual({ user: { data: [], eids: [] } });
  });

  test("Resolves priority queue by lowest number", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          data: [{ id: "data1", name: "Provider1" }],
          eids: [{ inserter: "optable.co", source: "uid2.com", uids: [{ id: "uid123" }, { id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 1 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE, priority: 2 },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.data).toEqual([{ id: "data1", name: "Provider1" }]);
    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "uid2.com",
        uids: [{ id: "uid123" }, { id: "uid456" }],
      },
    ]);

    expect(eidSources).toEqual(new Set<string>(["matcher_one"]));
  });

  test("Same priority will merge together", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          data: [{ id: "data1", name: "Provider1" }],
          eids: [{ inserter: "optable.co", source: "uid2.com", uids: [{ id: "uid123" }, { id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const mockTargetingFnThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "another.com", uids: [{ id: "blah" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 1 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE, priority: 1 },
      { targetingFn: () => mockTargetingFnThree, matcher: "matcher_three", mm: IDMatchMethod.INFERENCE, priority: 2 },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.data).toEqual([{ id: "data1", name: "Provider1" }]);
    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "uid2.com",
        uids: [{ id: "uid123" }, { id: "uid456" }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_two",
        mm: IDMatchMethod.INFERENCE,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
    ]);

    expect(eidSources).toEqual(new Set<string>(["matcher_one", "matcher_two"]));
  });

  test("Grabs lowest priority that HAS eids", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(createTargetingResponse({}));
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 1 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE, priority: 2 },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.data).toEqual([]);
    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_two",
        mm: IDMatchMethod.INFERENCE,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
    ]);

    expect(eidSources).toEqual(new Set<string>(["matcher_two"]));
  });

  test("ignores priorities lower then 1", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          data: [],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 0 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE, priority: -1 },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.data).toEqual([]);
    expect(ortb2.user!.eids).toEqual([]);
    expect(eidSources).toEqual(new Set<string>([]));
  });

  it("Should use matcher from response if provided on aggregate", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          eids: [
            {
              inserter: "optable.co",
              matcher: "matcher_one",
              mm: IDMatchMethod.AUTHENTICATED,
              source: "example.com",
              uids: [{ id: "uid456" }],
            },
          ],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_two",
        mm: IDMatchMethod.INFERENCE,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
    ]);
    expect(eidSources).toEqual(new Set<string>(["matcher_one", "matcher_two"]));
  });

  it("Should use matcher from response if provided with priority", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          eids: [
            {
              inserter: "optable.co",
              matcher: "matcher_one",
              mm: IDMatchMethod.AUTHENTICATED,
              source: "example.com",
              uids: [{ id: "uid456" }],
            },
          ],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, priority: 1 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_two", mm: IDMatchMethod.INFERENCE, priority: 2 },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        uids: [{ id: "uid456" }],
      },
    ]);
    expect(eidSources).toEqual(new Set<string>(["matcher_one"]));
  });

  it("Handles extension when priority based", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          refs: { "1": { some: "private things" } },
          eids: [
            {
              inserter: "optable.co",
              source: "example.com",
              ext: { eidOne: "eidOne" },
              uids: [{ id: "uid456", ext: { uidOne: "uidOne", optable: { ref: "1" } } }],
            },
          ],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          refs: { "1": { other: "private things" } },
          eids: [
            {
              inserter: "optable.co",
              source: "example.com",
              ext: { eidTwo: "eidTwo" },
              uids: [{ id: "uid456", ext: { uidTwo: "uidTwo", optable: { ref: "1" } } }],
            },
          ],
        })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 1 },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED, priority: 1 },
    ];

    const { ortb2, refs } = await resolveMultiNodeTargeting(configs);

    expect(refs).toEqual({
      "1": { some: "private things" },
      "2": { other: "private things" },
    });

    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        ext: { eidOne: "eidOne" },
        uids: [{ id: "uid456", ext: { uidOne: "uidOne", optable: { ref: "1" } } }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        ext: { eidTwo: "eidTwo" },
        uids: [{ id: "uid456", ext: { uidTwo: "uidTwo", optable: { ref: "2" } } }],
      },
    ]);
  });

  it("Handles extension when aggregate based", async () => {
    const mockTargetingFnOne = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          refs: { "1": { some: "private things" } },
          eids: [
            {
              inserter: "optable.co",
              source: "example.com",
              ext: { eidOne: "eidOne" },
              uids: [{ id: "uid456", ext: { uidOne: "uidOne", optable: { ref: "1" } } }],
            },
          ],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          refs: { "1": { other: "private things" } },
          eids: [
            {
              inserter: "optable.co",
              source: "example.com",
              ext: { eidTwo: "eidTwo" },
              uids: [{ id: "uid456", ext: { uidTwo: "uidTwo", optable: { ref: "1" } } }],
            },
          ],
        })
      );
    });

    const configs = [
      { targetingFn: () => mockTargetingFnOne, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED },
      { targetingFn: () => mockTargetingFnTwo, matcher: "matcher_one", mm: IDMatchMethod.AUTHENTICATED },
    ];

    const { ortb2, refs } = await resolveMultiNodeTargeting(configs);

    expect(refs).toEqual({
      "1": { some: "private things" },
      "2": { other: "private things" },
    });

    expect(ortb2.user!.eids).toEqual([
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        ext: { eidOne: "eidOne" },
        uids: [{ id: "uid456", ext: { uidOne: "uidOne", optable: { ref: "1" } } }],
      },
      {
        inserter: "optable.co",
        matcher: "matcher_one",
        mm: IDMatchMethod.AUTHENTICATED,
        source: "example.com",
        ext: { eidTwo: "eidTwo" },
        uids: [{ id: "uid456", ext: { uidTwo: "uidTwo", optable: { ref: "2" } } }],
      },
    ]);
  });

  test("properly aggregates and deduplicates all resolved ids", async () => {
    const matcherOneMMThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid123", "uid456"],
        })
      );
    });

    const matcherTwoMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid456", "uid-from-example-com"],
        })
      );
    });

    const matcherThreeMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid456", "uid-from-another-place"],
        })
      );
    });

    const configs = [
      { targetingFn: () => matcherOneMMThree },
      { targetingFn: () => matcherTwoMMFive },
      { targetingFn: () => matcherThreeMMFive },
    ];

    const { resolvedIds } = await resolveMultiNodeTargeting(configs);

    expect(resolvedIds).toEqual(
      new Set<string>(["uid123", "uid456", "uid-from-example-com", "uid-from-another-place"])
    );
  });

  test("properly get priority based resolved ids and deduplicates", async () => {
    const matcherOneMMThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid123", "uid234", "uid234"],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid123" }, { id: "uid234" }] }],
        })
      );
    });

    const matcherTwoMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid-from-example-com"],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid-from-example-com" }] }],
        })
      );
    });

    const matcherThreeMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid-from-another-place"],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid-from-another-place" }] }],
        })
      );
    });

    const configs = [
      { targetingFn: () => matcherOneMMThree, priority: 1, matcher: "matcher_one" },
      { targetingFn: () => matcherTwoMMFive, priority: 2, matcher: "matcher_two" },
      { targetingFn: () => matcherThreeMMFive, priority: 3, matcher: "matcher_three" },
    ];

    const { resolvedIds } = await resolveMultiNodeTargeting(configs);

    expect(resolvedIds).toEqual(new Set<string>(["uid123", "uid234"]));
  });

  test("properly get gt resolved ids from priority fallback", async () => {
    const matcherOneMMThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: [],
          eids: [],
        })
      );
    });

    const matcherTwoMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid-from-example-com"],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid-from-example-com" }] }],
        })
      );
    });

    const matcherThreeMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createTargetingResponse({
          resolved_ids: ["uid-from-another-place"],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid-from-another-place" }] }],
        })
      );
    });

    const configs = [
      { targetingFn: () => matcherOneMMThree, priority: 1, matcher: "matcher_one" },
      { targetingFn: () => matcherTwoMMFive, priority: 2, matcher: "matcher_two" },
      { targetingFn: () => matcherThreeMMFive, priority: 3, matcher: "matcher_three" },
    ];

    const { resolvedIds } = await resolveMultiNodeTargeting(configs);

    // Fallback to prio 2 since priority 1 has no eids
    expect(resolvedIds).toEqual(new Set<string>(["uid-from-example-com"]));
  });
});
