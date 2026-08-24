# QA and Debug Flags

Flags are per-session overrides used to exercise SDK behaviour that is otherwise decided automatically — forcing a split-test variant, bypassing consent, turning on verbose logging. They are set from the page URL and read back through `getFlags()`.

They are a QA and debugging facility. Nothing in normal operation depends on them, and none of them should be set on production traffic.

## Setting a flag

Append the flag name to the page URL. A bare name means enabled:

```
https://example.com/article?optableDebug
https://example.com/article?optableDebug=1     # same thing
https://example.com/article?optableDebug=0     # explicitly off
https://example.com/article?optableDebug&optableForceTargeting
```

Flags supplied in the URL are written to `sessionStorage`, so a flag set once stays in effect for the rest of the tab session — clicking through to another page keeps it on without re-appending the query string. Closing the tab clears everything.

To clear a flag before then, remove it from `sessionStorage` directly:

```js
sessionStorage.removeItem("optableDebug");
```

## Reading flags

Two accessors, and picking the right one matters.

**`flagEnabled(key)`** — for on/off flags. Returns `true` when the flag carries a value that is not `"0"`. An empty value counts as disabled:

```js
import { flagEnabled } from "@optable/web-sdk/lib/dist/core/flags";

if (flagEnabled("optableDebug")) {
  console.log("[wrapper]", ...args);
}
```

**`getFlags()`** — for flags with more than two meanings, where you need the raw value:

```js
import { getFlags } from "@optable/web-sdk/lib/dist/core/flags";

const controlGroup = getFlags().optableControlGroup;
if (controlGroup === "1") {
  // force control
} else if (controlGroup === "0") {
  // force treatment
}
```

> **Do not test a raw flag value for truthiness.** Values are strings, and `"0"` is truthy in JavaScript, so `if (getFlags().optableDebug)` is `true` for `?optableDebug=0`. Use `flagEnabled()` for on/off flags.

## Available flags

| Flag                        | Read by                                  | Effect                                                                                |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `optableDebug`              | `debugLog`, `optableMessage`, RTD module | Verbose logging.                                                                      |
| `optableDisableConsent`     | `getConsent`                             | Bypass the CMP and treat all permissions as granted.                                  |
| `optableControlGroup`       | `setupAB`                                | `1` forces the control variant, `0` forces treatment. Two-state — read the raw value. |
| `optableForceTargeting`     | wrapper code                             | Re-run targeting even when a session guard says it already ran.                       |
| `optableForceTokenize`      | wrapper code                             | Re-run tokenize even when a session guard says it already ran.                        |
| `optableForceGlobalRouting` | `buildRTD`                               | Route every EID to `global` instead of per-bidder.                                    |
| `optableForceSkipMerge`     | `buildRTD`                               | Skip merging EIDs into the auction entirely.                                          |
| `optableResolve1P`          | wrapper code                             | Resolve using a first-party test identifier.                                          |
| `optableResolve3P`          | wrapper code                             | Resolve using a third-party test IP.                                                  |
| `optableEnableAnalytics`    | wrapper code                             | Force analytics on, ignoring the sampling rate.                                       |
| `optableResolveId5`         | wrapper code                             | Return a placeholder ID5 value without loading the ID5 API.                           |
| `optableResolveID5ID`       | wrapper code                             | Return a specific ID5 value without loading the ID5 API.                              |

"Wrapper code" means the flag is recognised and persisted by the SDK, but acted on by the bundle built around it. Unknown query parameters are ignored — only the keys above are parsed.

## Resolution order

`parseFlags()` runs once per page load and the result is memoized:

1. Read the URL query string for every known key.
2. Persist whatever was found to `sessionStorage`.
3. For keys not in the URL, fall back to the `sessionStorage` value from an earlier page in this session.

A URL parameter therefore always beats a stored value, which is what makes a flag correctable mid-session: `?optableDebug=0` overwrites a stored `"1"`.

Both storage steps are wrapped in `try`/`catch`, so a browser with `sessionStorage` blocked degrades to URL-only flags rather than throwing.

## Using flags from a wrapper bundle

A wrapper does not need its own query-string parser. Call `getFlags()` once during initialization — that parses the URL and persists it — then read flags wherever needed:

```js
import { getFlags, flagEnabled } from "@optable/web-sdk/lib/dist/core/flags";

getFlags(); // parse + persist for the session

function log(...args) {
  if (flagEnabled("optableDebug")) {
    console.log("[wrapper]", ...args);
  }
}
```

Call it before anything that reads a flag. Addons that read flags internally — `setupAB` and `buildRTD` — call `getFlags()` themselves, so ordering only matters for a wrapper's own reads.

## Testing

`resetFlags()` clears the memoized result so the next `getFlags()` re-parses. It is intended for tests, which need to simulate successive page loads:

```js
window.location = { search: "?optableDebug=1" };
resetFlags();
expect(flagEnabled("optableDebug")).toBe(true);
```

## API

| Export        | Signature                          | Description                                                                  |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `getFlags`    | `() => Flags`                      | Parsed flags for this page load. Memoized; persists URL flags on first call. |
| `flagEnabled` | `(key: FlagKey) => boolean`        | True when a flag is present and not `"0"`. Use for on/off flags.             |
| `resetFlags`  | `() => void`                       | Clears the memoized result so the next `getFlags()` re-parses.               |
| `FlagKey`     | union of flag names                | Type of a recognised flag key.                                               |
| `Flags`       | `Partial<Record<FlagKey, string>>` | Type of the parsed flag object.                                              |
