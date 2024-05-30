class BlockablePromise<T> {
  private state: "pending" | "fulfilled" | "rejected" | "timeout" | "blocked" = "pending";
  private opt?: { timeout: number };
  resolve: (value: T | PromiseLike<T>) => void = () => {};
  reject: (reason?: any) => void = () => {};
  finally: () => void = () => {};
  block = () => {};
  promise: Promise<void | Awaited<T>>;

  constructor(executor?: (resolve: (value: T) => void, reject: (reason: any) => void) => void, opt?: { timeout: number });
  constructor(opt: { timeout: number });
  constructor(executorOrOpt?: ((resolve: (value: T) => void, reject: (reason: any) => void) => void) | { timeout: number }, opt?: { timeout: number }) {
    if (typeof executorOrOpt === "object") {
      this.opt = executorOrOpt;
      executorOrOpt = undefined;
    } else {
      this.opt = opt;
    }

    const noop = (_v: unknown) => {};

    // timeout, default to Infinite
    const time = this.opt?.timeout ?? 2147483647;
    let timeoutRef: NodeJS.Timeout | null = null;
    timeoutRef = setTimeout(() => {
      this.state = "timeout";
      block("timeout");
    }, time);

    // block promise
    let blockPromiseReject = noop;
    const block = (r?: string) => {
      this.state = "blocked";
      blockPromiseReject(r ?? "blocked");
      timeoutRef && clearTimeout(timeoutRef);
      timeoutRefMainPromise && clearTimeout(timeoutRefMainPromise);
    };
    const blockPromise = new Promise<void>((_, rej) => {
      blockPromiseReject = rej;
    });

    let timeoutRefMainPromise: NodeJS.Timeout | null = null;
    const wrapPromise = new Promise<T>((res, rej) => {
      // expose to outside
      this.resolve = res;
      this.reject = rej;

      const promiseBody = (r: (v: any) => void) => {
        timeoutRefMainPromise = setTimeout(r, time);
      };
      const mainPromise = new Promise(executorOrOpt ?? promiseBody);
      mainPromise.then(res);
      mainPromise.catch(rej);
      mainPromise.finally(this.finally);
    });

    wrapPromise
      .then(() => {
        this.state = "fulfilled";
        timeoutRef && clearTimeout(timeoutRef);
        timeoutRefMainPromise && clearTimeout(timeoutRefMainPromise);
      })
      .catch(() => {
        this.state = "rejected";
        timeoutRef && clearTimeout(timeoutRef);
        timeoutRefMainPromise && clearTimeout(timeoutRefMainPromise);
      });

    this.block = block;
    this.promise = Promise.race([wrapPromise, blockPromise]);
  }
}
