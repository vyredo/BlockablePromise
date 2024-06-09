type Opt = { timeout: number };
export class TimeoutPromise<T> {
  private state: "pending" | "fulfilled" | "rejected" | "timeout" = "pending";
  private opt?: Opt;
  resolve: (value: T | PromiseLike<T>) => void = () => {};
  reject: (reason?: any) => void = () => {};
  finally: () => void = () => {};
  promise: Promise<undefined | Awaited<T>>;

  constructor(executor?: (resolve: (value: T) => void, reject: (reason: any) => void) => void, opt?: Opt);
  constructor(opt: Opt);
  constructor(
    executorOrOpt?: ((resolve: (value: T) => void, reject: (reason: any) => void) => void) | Opt,
    // default in second
    opt?: Opt
  ) {
    if (typeof executorOrOpt === "object" && "timeout" in executorOrOpt) {
      this.opt = executorOrOpt;
      executorOrOpt = undefined;
    } else {
      this.opt = opt;
    }

    // timeout, default to Infinite
    let time = this.opt?.timeout ?? 2147483647;

    // default to second
    time = time < 1000 ? time * 1000 : time;

    console.log("timeout >>> time >>>", time);
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

    const a = Promise.race([timeoutPromise, wrapPromise]);
    this.promise = a.then(() => undefined);
  }
}
