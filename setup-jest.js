import "whatwg-fetch";
import { TextEncoder } from "node:util";
import { TransformStream, WritableStream, ReadableStream } from "node:stream/web";
import { BroadcastChannel } from "node:worker_threads";

global.TextEncoder = TextEncoder;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;
global.ReadableStream = ReadableStream;
global.BroadcastChannel = BroadcastChannel;
