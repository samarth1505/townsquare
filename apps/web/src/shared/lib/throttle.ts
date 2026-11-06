// Runs `fn` at most once every `ms`, but never loses the LAST call (trailing run).
// Used for high-frequency events such as scroll. (Debounce waits for silence; throttle keeps a steady rate.)
export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const run = (args: A) => {
    last = Date.now();
    fn(...args);
  };

  const throttled = (...args: A) => {
    const remaining = ms - (Date.now() - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = undefined;
      run(args); // enough time has passed: run now
    } else {
      pending = args; // too soon: remember the latest call and run it when the window ends
      timer ??= setTimeout(() => {
        timer = undefined;
        if (pending) run(pending);
        pending = undefined;
      }, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  return throttled;
}
