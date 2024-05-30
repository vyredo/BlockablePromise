# BlockablePromise
A JavaScript utility class to create promises that can be blocked, resolved, or rejected and have a timeout.

### Features
- Blockable: You can block the promise to prevent it from resolving or rejecting.
- Timeout: Optionally set a timeout after which the promise will be blocked.
- Cancelable: Cancel the promise by blocking it.

### Example Code

```typescript

async function testBlockablePromise() {
  const sleepTime = 5000; // 5 seconds
  const start = Date.now();
  // sleep 5 seconds
  const sleep = new BlockablePromise((r) => setTimeout(r, sleepTime));

  // ============== BLOCK after 2 seconds ==============
  (async () => {
    setTimeout(() => {
      console.log("Block the promise after 2 seconds");
      sleep.block();
    }, 2000);

    try {
      const result = await sleep.promise;
      console.log(Date.now() - start + " resolved sucessfully");
    } catch (e) {
      console.log(Date.now() - start + " Promise was", e);
    }
  })();

  // ============== TIMEOUT after 4 seconds ==============
  (async () => {
    const sleepWithTimeout = new BlockablePromise((r) => setTimeout(r, sleepTime), { timeout: 4000 });
    try {
      const result = await sleepWithTimeout.promise;
      console.log(Date.now() - start + " resolved sucessfully");
    } catch (e) {
      console.log(Date.now() - start + " Promise was", e);
    }
  })();

  // ============== SUCCESS after 5 seconds ==============
  (async () => {
    const _sleep = new BlockablePromise((r) => setTimeout(r, sleepTime));
    try {
      await _sleep.promise;
      console.log(Date.now() - start + " resolved sucessfully");
    } catch (e) {
      console.log(Date.now() - start + " Promise was", e);
    }
  })();
}

testBlockablePromise();


```
**Logs: **
```
Block the promise after 2 seconds
2006 Promise was blocked
4002 Promise was timeout
5003 resolved sucessfully
```
