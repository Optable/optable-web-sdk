import "whatwg-fetch";
import { TextEncoder } from "node:util";
import { TransformStream } from "node:stream/web";
import { BroadcastChannel } from "node:worker_threads";
import { webcrypto } from "node:crypto";

global.TextEncoder = TextEncoder;
global.TransformStream = TransformStream;
global.BroadcastChannel = BroadcastChannel;

Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
});
