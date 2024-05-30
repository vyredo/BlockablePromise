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
  () => {
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
  }()

  // ============== TIMEOUT after 4 seconds ==============
  () => {
    const sleepWithTimeout = new BlockablePromise((r) => setTimeout(r, sleepTime), { timeout: 4000 });
    try {
      const result = await sleepWithTimeout.promise;
      console.log(Date.now() - start + " resolved sucessfully");
    } catch (e) {
      console.log(Date.now() - start + " Promise was", e);
    }
  }()
}


```
**Logs: **
```
Block the promise after 2 seconds
2005 Promise was blocked
4001 Promise was timeout
```
