import { parsePushTarget, PUSH_TARGETS } from "./target";

describe("parsePushTarget (a push payload is untrusted)", () => {
  it.each(PUSH_TARGETS)("accepts the known route %s", (url) => {
    expect(parsePushTarget({ url })).toBe(url);
  });

  it.each([
    ["null", null],
    ["a string", "/account"],
    ["no url", {}],
    ["a number", { url: 5 }],
    ["an unknown route", { url: "/admin" }],
    ["an external link", { url: "https://evil.example.com" }],
    ["a custom scheme", { url: "hub://notifications" }],
    ["a protocol-relative link", { url: "//evil.example.com" }],
    ["a known route with a query", { url: "/account?next=/admin" }],
  ])("rejects %s", (_name, data) => {
    expect(parsePushTarget(data)).toBeNull();
  });
});
