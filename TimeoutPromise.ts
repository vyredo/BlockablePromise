class TimeoutPromise<T> {
  private state: "pending" | "fulfilled" | "rejected" | "timeout" = "pending";
  private opt?: { timeout: number };
  resolve: (value: T | PromiseLike<T>) => void = () => {};
  reject: (reason?: any) => void = () => {};
  finally: () => void = () => {};
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

    // timeout, default to Infinite
    const time = this.opt?.timeout ?? 2147483647;
    let timeoutRef: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<void>((_, rej) => {
      timeoutRef = setTimeout(() => {
        this.state = "timeout";
        rej("timeout");
      }, time);
    });

    const wrapPromise = new Promise<T>((res, rej) => {
      // expose to outside
      this.resolve = res;
      this.reject = rej;

      const promiseBody = (r: (v: any) => void) => {
        setTimeout(r, time);
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
      })
      .catch(() => {
        this.state = "rejected";
        timeoutRef && clearTimeout(timeoutRef);
      });

    this.promise = Promise.race([timeoutPromise, wrapPromise]);
  }
}
