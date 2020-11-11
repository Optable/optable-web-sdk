import OptableSDK from "./sdk";

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

test("cid is correct", () => {
  const expected = "c:FooBarBAZ-01234#98765.!!!";

  expect(expected).toEqual(OptableSDK.cid("FooBarBAZ-01234#98765.!!!"));
  expect(expected).toEqual(OptableSDK.cid(" FooBarBAZ-01234#98765.!!!"));
  expect(expected).toEqual(OptableSDK.cid("FooBarBAZ-01234#98765.!!!  "));
  expect(expected).toEqual(OptableSDK.cid("  FooBarBAZ-01234#98765.!!!  "));
});

test("cid is case sensitive", () => {
  const unexpected = "c:FooBarBAZ-01234#98765.!!!";

  expect(OptableSDK.cid("foobarBAZ-01234#98765.!!!")).not.toEqual(unexpected);
});
