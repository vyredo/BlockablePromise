# TimeoutPromise
A JavaScript utility class to create promises that have a timeout and follow Promise.withResolvers().

### Features
- Timeout: Optionally set a timeout after which the promise will be blocked.
- can run promise.reject and promise.resolve outside of promise constructor

### Example Code

```typescript

async function testBlockablePromise() {
  const sleepTime = 5000; // 5 seconds
  const start = Date.now();
  // sleep 5 seconds
  const sleep = new TimeoutPromise((r) => setTimeout(r, sleepTime));

  // ============== REJECT after 2 seconds ==============
  (async () => {
    setTimeout(() => {
      console.log("Block the promise after 2 seconds");
      sleep.reject("rejected");
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
    const sleepWithTimeout = new TimeoutPromise((r) => setTimeout(r, sleepTime), { timeout: 4000 });
    try {
      const result = await sleepWithTimeout.promise;
      console.log(Date.now() - start + " resolved sucessfully");
    } catch (e) {
      console.log(Date.now() - start + " Promise was", e);
    }
  })();

  // ============== SUCCESS after 5 seconds ==============
  (async () => {
    const _sleep = new TimeoutPromise((r) => setTimeout(r, sleepTime));
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
