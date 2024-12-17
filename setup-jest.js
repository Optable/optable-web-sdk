import "whatwg-fetch";
import { TextEncoder } from "node:util";
import { TransformStream } from "node:stream/web";
import { BroadcastChannel } from "node:worker_threads";

global.TextEncoder = TextEncoder;
global.TransformStream = TransformStream;
global.BroadcastChannel = BroadcastChannel;
