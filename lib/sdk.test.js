import OptableSDK from "./sdk";

beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

afterEach(() => jest.restoreAllMocks());

test("eid is correct", () => {
  const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

  expect(OptableSDK.eid("123")).toEqual(expected);
  expect(OptableSDK.eid("123 ")).toEqual(expected);
  expect(OptableSDK.eid(" 123")).toEqual(expected);
  expect(OptableSDK.eid(" 123 ")).toEqual(expected);
});

test("eid ignores case", () => {
  const var1 = "tEsT@FooBarBaz.CoM";
  const var2 = "test@foobarbaz.com";
  const var3 = "TEST@FOOBARBAZ.COM";
  const var4 = "TeSt@fOObARbAZ.cOm";
  const eid = OptableSDK.eid(var1);

  expect(eid).toEqual(OptableSDK.eid(var2));
  expect(eid).toEqual(OptableSDK.eid(var3));
  expect(eid).toEqual(OptableSDK.eid(var4));
});

test("cid rejects non-string id", () => {
  expect(() => OptableSDK.cid(1)).toThrow();
});

test("cid prefixes with c: by default", () => {
  expect(OptableSDK.cid("abc")).toEqual("c:abc");
});

test("cid accepts a custom variant", () => {
  expect(OptableSDK.cid("abc", 0)).toEqual("c:abc");
  for (let i = 1; i < 10; i++) {
    expect(OptableSDK.cid("abc", i)).toEqual(`c${i}:abc`);
  }

  expect(() => OptableSDK.cid("abc", -1)).toThrow();
  expect(() => OptableSDK.cid("abc", 10)).toThrow();
  expect(() => OptableSDK.cid("abc", "1")).toThrow();
});

test("cid trim spaces", () => {
  expect(OptableSDK.cid(" \n abc\t")).toEqual("c:abc");
});

test("cid preserve case", () => {
  expect(OptableSDK.cid("ABCD")).toEqual("c:ABCD");
});

test("passport is passed along", async () => {
  const buildRes = (passport) => ({
    headers: new Headers({ "Content-Type": "application/json", "X-Optable-Visitor": passport }),
    ok: true,
    json: () => Promise.resolve({}),
  });

  global.fetch.mockImplementationOnce(() => Promise.resolve(buildRes("one")));
  global.fetch.mockImplementationOnce(() => Promise.resolve(buildRes("two")));
  global.fetch.mockImplementationOnce(() => Promise.resolve(buildRes("three")));

  const sdk = new OptableSDK({
    host: "node1.cloud.test",
    site: "test",
    cookies: false,
    initPassport: false,
  });

  let request;
  await sdk.identify("c:id").catch(() => {});

  request = global.fetch.mock.lastCall[0];
  expect(request.headers.get("X-Optable-Visitor")).toBe(null);

  await sdk.identify("c:id").catch(() => {});
  request = global.fetch.mock.lastCall[0];
  expect(request.headers.get("X-Optable-Visitor")).toBe("one");

  await sdk.identify("c:id").catch(() => {});
  request = global.fetch.mock.lastCall[0];
  expect(request.headers.get("X-Optable-Visitor")).toBe("two");

  await sdk.identify("c:id").catch(() => {});
  request = global.fetch.mock.lastCall[0];
  expect(request.headers.get("X-Optable-Visitor")).toBe("three");
});
