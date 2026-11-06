export const REDACTED = "[redacted]";
const TRUNCATED = "[truncated]";
const MAX_DEPTH = 6; // also protects against circular objects

// A property whose NAME suggests a secret or personal data has its value replaced, whatever it contains.
// (It also catches harmless names such as "discard": over-redacting is the safe direction to be wrong in.)
const SENSITIVE_KEY =
  /pass(word)?|token|secret|authorization|cookie|otp|phone|mobile|email|ssn|card/i;
// ...and any long digit run that looks like a phone number is removed from free text (messages, URLs, stacks).
const PHONE_LIKE = /\+?\d[\d\s-]{8,}\d/g;
const BEARER = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;

export function redactString(text: string): string {
  return text.replace(BEARER, `Bearer ${REDACTED}`).replace(PHONE_LIKE, REDACTED);
}

// Returns a CLEANED COPY (the original is never modified). Third-party services must never see personal data or
// secrets, and error messages/contexts are exactly where they leak: "Invalid OTP for +91 98765 43210".
export function redact(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return redactString(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return TRUNCATED;
  if (value instanceof Error) return redactError(value);
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? REDACTED : redact(inner, depth + 1);
  }
  return result;
}

// An Error keeps its type and its stack (monitoring needs them), but its text is cleaned.
export function redactError(error: Error): Error {
  const clean = new Error(redactString(error.message));
  clean.name = error.name;
  if (error.stack) clean.stack = redactString(error.stack);
  return clean;
}
