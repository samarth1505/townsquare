// Pure function: same input -> same output, no React, no DOM. Web and React Native both reuse it.
export function maskPhone(phone: string): string {
  const visible = phone.slice(-4);
  const hidden = "•".repeat(Math.max(phone.length - 4, 0));
  return hidden + visible;
}
