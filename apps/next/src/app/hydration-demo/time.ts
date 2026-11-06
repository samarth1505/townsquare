// Shows the time down to the millisecond, so the server's value and the browser's value can never match by luck.
export function timeWithMilliseconds(): string {
  const now = new Date();
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${now.toLocaleTimeString("en-US", { timeZone: "UTC" })}.${ms}`;
}
