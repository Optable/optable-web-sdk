# Command Queue Addon

A command queue for wrappers loaded via an async script tag, in the style of `googletag.cmd` and `pbjs.que`. It lets a page interact with the wrapper before the script has loaded.

## Usage

The page defines a plain-array stub and queues calls against it:

```html
<script>
  window.optable = window.optable || { cmd: [] };
  window.optable.cmd.push(() => {
    // Runs once the wrapper has loaded.
  });
</script>
<script async src="https://.../wrapper.js"></script>
```

During initialization the wrapper swaps the stub for an instance:

```js
import { OptableCommands } from "@optable/web-sdk/lib/dist/addons/commands";

window.optable.cmd = new OptableCommands(window.optable.cmd || []);
```

The constructor drains everything queued while the script was loading. After the swap, `push()` executes its argument immediately and returns its value.

Non-function entries in the pre-load queue are ignored, a missing or non-array queue is tolerated, and a queued function that throws is logged to the console without stopping the rest of the queue — so a page that clobbers the stub or queues a broken function cannot break wrapper initialization.
