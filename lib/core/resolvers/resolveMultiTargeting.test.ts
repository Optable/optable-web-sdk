import { resolveMultiNodeTargeting, TargetingResponse } from "./resolveMultiTargeting.ts";
import { IDMatchMethod } from "iab-adcom";

const createOrtb2Response = ({ data = [], eids = [] }: { data?: any; eids?: any }) => {
  return {
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
        createOrtb2Response({
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
        createOrtb2Response({
          data: [],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }],
        })
      );
    });

    const matcherThreeMMFive = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({
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
    const emptyTargetingOne = new Promise<TargetingResponse>((resolve) => resolve(createOrtb2Response({})));
    const emptyTargetingTwo = new Promise<TargetingResponse>((resolve) => resolve(createOrtb2Response({})));

    const configs = [
      { targetingFn: () => emptyTargetingOne, matcher: "matcher_one", mm: IDMatchMethod.COOKIE_SYNC },
      { targetingFn: () => emptyTargetingTwo, matcher: "matcher_two", mm: IDMatchMethod.COOKIE_SYNC },
    ];

    const { ortb2, eidSources } = await resolveMultiNodeTargeting(configs);

    expect(eidSources).toEqual(new Set<string>([]));
    expect(ortb2).toEqual({ user: { data: [], eids: [] } });
  });

  test("resolves empty responses gracefully for priority resolving", async () => {
    const emptyTargetingOne = new Promise<TargetingResponse>((resolve) => resolve(createOrtb2Response({})));
    const emptyTargetingTwo = new Promise<TargetingResponse>((resolve) => resolve(createOrtb2Response({})));

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
        createOrtb2Response({
          data: [{ id: "data1", name: "Provider1" }],
          eids: [{ inserter: "optable.co", source: "uid2.com", uids: [{ id: "uid123" }, { id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
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
        createOrtb2Response({
          data: [{ id: "data1", name: "Provider1" }],
          eids: [{ inserter: "optable.co", source: "uid2.com", uids: [{ id: "uid123" }, { id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
      );
    });

    const mockTargetingFnThree = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({ eids: [{ inserter: "optable.co", source: "another.com", uids: [{ id: "blah" }] }] })
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
      resolve(createOrtb2Response({}));
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
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
        createOrtb2Response({
          data: [],
          eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }],
        })
      );
    });

    const mockTargetingFnTwo = new Promise<TargetingResponse>((resolve) => {
      resolve(
        createOrtb2Response({ eids: [{ inserter: "optable.co", source: "example.com", uids: [{ id: "uid456" }] }] })
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
});
