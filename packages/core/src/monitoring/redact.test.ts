import { describe, expect, it } from "vitest";
import { REDACTED, redact, redactError, redactString } from "./redact";

describe("redactString", () => {
  it("removes phone-number-like digit runs from free text", () => {
    expect(redactString("OTP failed for +91 98765 43210")).toBe(`OTP failed for ${REDACTED}`);
    expect(redactString("user 9876543210 not found")).toBe(`user ${REDACTED} not found`);
  });

  it("removes bearer tokens", () => {
    expect(redactString("Authorization: Bearer abc.def-123")).toBe(
      `Authorization: Bearer ${REDACTED}`,
    );
  });

  it("leaves ordinary text and short numbers alone", () => {
    expect(redactString("Failed to load feed page 3 (status 500)")).toBe(
      "Failed to load feed page 3 (status 500)",
    );
  });
});

describe("redact", () => {
  it("replaces the value of sensitive KEYS, whatever the value is", () => {
    const clean = redact({
      phone: "123",
      accessToken: "t",
      Password: "p",
      otp: "1",
      route: "/home",
    });
    expect(clean).toEqual({
      phone: REDACTED,
      accessToken: REDACTED,
      Password: REDACTED,
      otp: REDACTED,
      route: "/home",
    });
  });

  it("works through nested objects and arrays", () => {
    const clean = redact({
      a: [{ email: "x@y.z", ok: 1 }],
      b: { headers: { authorization: "Bearer x" } },
    });
    expect(clean).toEqual({
      a: [{ email: REDACTED, ok: 1 }],
      b: { headers: { authorization: REDACTED } },
    });
  });

  it("never modifies the original", () => {
    const original = { token: "secret", nested: { phone: "9876543210" } };
    redact(original);
    expect(original).toEqual({ token: "secret", nested: { phone: "9876543210" } });
  });

  it("survives a circular object", () => {
    const loop: Record<string, unknown> = { name: "x" };
    loop.self = loop;
    expect(() => redact(loop)).not.toThrow();
  });

  it("passes primitives through", () => {
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });
});

describe("redactError", () => {
  it("keeps the type and stack but cleans the message", () => {
    const original = new TypeError("bad number 9876543210");
    const clean = redactError(original);
    expect(clean).toBeInstanceOf(Error);
    expect(clean.name).toBe("TypeError");
    expect(clean.message).toBe(`bad number ${REDACTED}`);
    expect(clean.stack).toBeDefined();
    expect(original.message).toBe("bad number 9876543210"); // original untouched
  });
});
