import { resolveHostAlias, DEFAULT_HOST_ALIASES } from "./host-alias.ts";

describe("resolveHostAlias", () => {
  test("resolves an aliased host", () => {
    expect(resolveHostAlias("acast.cloud.optable.co")).toBe("acast.cloud.us.optable.co");
  });

  test("returns null for a host with no alias", () => {
    expect(resolveHostAlias("dcn.customer.com")).toBeNull();
  });

  test("returns null for a host that is already the alias target", () => {
    expect(resolveHostAlias("acast.cloud.us.optable.co")).toBeNull();
  });

  test("returns null for a missing host", () => {
    expect(resolveHostAlias("")).toBeNull();
    expect(resolveHostAlias(undefined)).toBeNull();
  });

  test("matches the host case insensitively", () => {
    expect(resolveHostAlias("Acast.Cloud.Optable.CO")).toBe("acast.cloud.us.optable.co");
  });

  test("returns null for hosts inherited from Object.prototype", () => {
    expect(resolveHostAlias("constructor")).toBeNull();
    expect(resolveHostAlias("__proto__")).toBeNull();
    expect(resolveHostAlias("toString")).toBeNull();
  });

  test("returns null for a self-alias", () => {
    expect(resolveHostAlias("a.example.com", { "a.example.com": "a.example.com" })).toBeNull();
  });

  test("accepts a custom alias map", () => {
    const aliases = { "old.example.com": "new.example.com" };
    expect(resolveHostAlias("old.example.com", aliases)).toBe("new.example.com");
    expect(resolveHostAlias("acast.cloud.optable.co", aliases)).toBeNull();
  });

  test("every default alias points at a host that is not itself aliased", () => {
    for (const target of Object.values(DEFAULT_HOST_ALIASES)) {
      expect(resolveHostAlias(target)).toBeNull();
    }
  });
});
