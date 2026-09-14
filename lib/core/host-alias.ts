/*
 * A host alias rewrites the `host` an SDK instance was configured with to the
 * host that now serves it. The map ships inside the bundle, so a page still
 * serving an old snippet reaches the new host with no snippet edit. The SDK
 * also records the pre-alias host so that the visitor keeps their cached
 * passport across the move. See generatePassportKeys() in storage-keys.ts.
 *
 * An alias is a stopgap. Publisher snippets should still be updated to the new
 * host, and the entry removed once the old host is retired.
 */

export type HostAliasMap = Record<string, string>;

export const DEFAULT_HOST_ALIASES: HostAliasMap = {
  "acast.cloud.optable.co": "acast.cloud.us.optable.co",
};

/*
 * resolveHostAlias() returns the host that replaces `host`, or null when the
 * host is missing, has no alias, or aliases to itself.
 */
export function resolveHostAlias(
  host: string | undefined,
  aliases: HostAliasMap = DEFAULT_HOST_ALIASES
): string | null {
  if (!host) {
    return null;
  }

  // Host names are case insensitive, so match on a lowercased key.
  const key = host.toLowerCase();

  // hasOwnProperty guards against inherited Object.prototype members being
  // picked up when an unexpected host like "constructor" is looked up.
  if (!Object.prototype.hasOwnProperty.call(aliases, key)) {
    return null;
  }

  const alias = aliases[key];

  // A self-alias would make the SDK read the same storage keys twice and set a
  // pointless legacy host, so treat it as no alias at all.
  if (!alias || alias.toLowerCase() === key) {
    return null;
  }

  return alias;
}
